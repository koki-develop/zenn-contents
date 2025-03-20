---
title: "Cloud Run + Litestream で RDB を使いつつ費用を格安に抑える"
emoji: "💰"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["gc24", "googlecloud", "cloudrun", "litestream", "terraform"]
published: true
published_at: 2024-02-05 18:00
---

前から気になっていた [Litestream](https://litestream.io/) を Cloud Run で使ってみたので、そのメモです。

- [Litestream とは？](#litestream-とは)
- [サンプルコード](#サンプルコード)
- [手順](#手順)
- [動作確認してみる](#動作確認してみる)
- [制限事項](#制限事項)
- [おまけ](#おまけ)
- [まとめ](#まとめ)
- [参考](#参考)

# Litestream とは？

Litestream は、 **SQLite のデータベースファイルを Amazon S3 や Google Cloud Storage などのオブジェクトストレージにリアルタイムでレプリケートする**ことができるオープンソースのツールです。

https://litestream.io/

例えば通常 Cloud Run で DB エンジンとして SQLite を使用しようとしても、コンテナが破棄されると同時に毎回 SQLite のデータベースファイルも消えてしまうため、**データを永続化することができません**。
しかし Litestream を使用すれば、 SQLite のデータベースファイルをオブジェクトストレージにリアルタイムでレプリケートし、 Cloud Run のコンテナが起動するたびにデータベースファイルを復元することができます。
これにより、 **Cloud Run で SQLite を使用しつつもデータを永続化する**ことが実現可能となります。
また、オブジェクトストレージにデータを保存するため、 Cloud SQL などの RDB サービスを使用する場合と比べると**格段に費用を安く抑えることができます**。

# サンプルコード

今回紹介するサンプルコードは以下のリポジトリで管理しています。

https://github.com/koki-develop/litetodo

# 手順

## 1. Web アプリケーションを作成

まずは簡単な Web アプリケーションを作成します。
なんでもいいのですが、今回は Go + [Echo](https://echo.labstack.com/) で簡単な REST API を実装してみます。
今回の本筋とはあまり関係ないので、ソースコードについての詳細な説明は省略します。

:::details ソースコード

```go:main.go
package main

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/labstack/echo/v4"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	if err := run(); err != nil {
		fmt.Printf("Error: %+v\n", err)
		os.Exit(1)
	}
}

type Task struct {
	ID        uint      `json:"id"`
	Title     string    `json:"title"`
	Completed bool      `json:"completed"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type TaskCreateInput struct {
	Title string `json:"title"`
}

type TaskUpdateInput struct {
	Title     *string `json:"title"`
	Completed *bool   `json:"completed"`
}

func run() error {
	/*
	 * Open database
	 */

	db, err := gorm.Open(sqlite.Open("./todo.db"), &gorm.Config{})
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}

	/*
	 * Migrate database
	 */

	if err := db.AutoMigrate(&Task{}); err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}

	/*
	 * Setup routes
	 */

	e := echo.New()

	e.GET("/tasks", func(c echo.Context) error {
		var ts []Task
		if err := db.Find(&ts).Error; err != nil {
			return fmt.Errorf("failed to find tasks: %w", err)
		}

		return c.JSON(http.StatusOK, ts)
	})

	e.GET("/tasks/:id", func(c echo.Context) error {
		var t Task
		if err := db.First(&t, c.Param("id")).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				return c.JSON(http.StatusNotFound, map[string]string{"message": "Not Found"})
			}
			return fmt.Errorf("failed to find task: %w", err)
		}

		return c.JSON(http.StatusOK, t)
	})

	e.POST("/tasks", func(c echo.Context) error {
		var ipt TaskCreateInput
		if err := c.Bind(&ipt); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"message": "Bad Request"})
		}

		var t = Task{Title: ipt.Title}
		if err := db.Create(&t).Error; err != nil {
			return fmt.Errorf("failed to create task: %w", err)
		}

		return c.JSON(http.StatusOK, t)
	})

	e.PATCH("/tasks/:id", func(c echo.Context) error {
		var ipt TaskUpdateInput
		if err := c.Bind(&ipt); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"message": "Bad Request"})
		}

		var t Task
		if err := db.First(&t, c.Param("id")).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				return c.JSON(http.StatusNotFound, map[string]string{"message": "Not Found"})
			}
			return fmt.Errorf("failed to find task: %w", err)
		}

		if ipt.Title != nil {
			t.Title = *ipt.Title
		}
		if ipt.Completed != nil {
			t.Completed = *ipt.Completed
		}
		if err := db.Save(&t).Error; err != nil {
			return fmt.Errorf("failed to save task: %w", err)
		}

		return c.JSON(http.StatusOK, t)
	})

	e.DELETE("/tasks/:id", func(c echo.Context) error {
		var t Task
		if err := db.First(&t, c.Param("id")).Error; err != nil {
			return fmt.Errorf("failed to find task: %w", err)
		}

		if err := db.Delete(&t).Error; err != nil {
			return fmt.Errorf("failed to delete task: %w", err)
		}

		return c.NoContent(http.StatusNoContent)
	})

	/*
	 * Start server
	 */

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	if err := e.Start(fmt.Sprintf(":%s", port)); err != nil {
		return fmt.Errorf("failed to start server: %w", err)
	}

	return nil
}
```

:::

:::details 動作確認

アプリケーションをビルドして実行すると、以下のように Web サーバーが起動します。

```sh
$ go build -o ./app .
$ ./app

   ____    __
  / __/___/ /  ___
 / _// __/ _ \/ _ \
/___/\__/_//_/\___/ v4.11.4
High performance, minimalist Go web framework
https://echo.labstack.com
____________________________________O/_______
                                    O\
⇨ http server started on [::]:8080
```

こんな感じで使えます。

```sh
# タスクを作成
$ curl -X POST localhost:8080/tasks -H 'Content-Type: application/json' --data '{ "title": "aaa" }'
{
  "id": 1,
  "title": "aaa",
  "completed": false,
  "created_at": "2024-02-02T22:09:54.73925+09:00",
  "updated_at": "2024-02-02T22:09:54.73925+09:00"
}

# タスクの一覧を取得
$ curl localhost:8080/tasks
[
  {
    "id": 1,
    "title": "aaa",
    "completed": false,
    "created_at": "2024-02-02T22:09:54.73925+09:00",
    "updated_at": "2024-02-02T22:09:54.73925+09:00"
  }
]

# 単一のタスクを取得
$ curl localhost:8080/tasks/1
{
  "id": 1,
  "title": "aaa",
  "completed": false,
  "created_at": "2024-02-02T22:09:54.73925+09:00",
  "updated_at": "2024-02-02T22:09:54.73925+09:00"
}

# タスクを更新
$ curl -X PATCH localhost:8080/tasks/1 -H 'Content-Type: application/json' --data '{ "title": "updated", "completed": true }'
{
  "id": 1,
  "title": "updated",
  "completed": true,
  "created_at": "2024-02-02T22:09:54.73925+09:00",
  "updated_at": "2024-02-02T22:11:40.148087+09:00"
}

# タスクを削除
$ curl -X DELETE localhost:8080/tasks/1
```

:::

DB エンジンに SQLite を使用しています。

```go:main.go
import (
	// ...
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	// ...
)

func main() {
	// ...

	db, err := gorm.Open(sqlite.Open("./todo.db"), &gorm.Config{})
	if err != nil {
		// ...
	}

	// ...
}
```

接続するポート番号を `PORT` 環境変数で指定できるようにしています。

```go:main.go
import (
	// ...
	"github.com/labstack/echo/v4"
	// ...
)

func main() {
	// ...

	e := echo.New()

	// ...

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // デフォルトのポート番号
	}
	if err := e.Start(fmt.Sprintf(":%s", port)); err != nil {
		// ...
	}

	// ...
}
```

## 2. Google Cloud プロジェクトを作成

それではまず Google Cloud コンソールから新しいプロジェクトを作成していきます。

左上の `プロジェクトを選択` をクリックし、ダイアログの右上の `新しいプロジェクト` をクリックします。

![](/images/google-cloudrun-litestream/to-create-project.png)
_プロジェクト選択ダイアログ_

`プロジェクト名` に任意の名前を入力します。また、必要に応じてプロジェクト ID も変更します。
今回はプロジェクト名もプロジェクト ID も `litetodo` としました。

`作成` をクリックするとプロジェクトが作成されます。

![](/images/google-cloudrun-litestream/create-project.png)
_プロジェクトを作成_

これ以降の操作では基本的に gcloud CLI もしくは Terraform を使用してリソースを作成していきます。

## 3. Cloud Storage バケットを作成

SQLite のデータベースファイルのレプリケート先として使用する Cloud Storage バケットを作成します。
今回は `litetodo-db` という名前で作成しました。

:::details gcloud CLI

```sh
$ gcloud storage buckets create "gs://<BUCKET_NAME>" --location="<LOCATION>"

# 今回の場合
$ gcloud storage buckets create "gs://litetodo-db" --location="asia-northeast1"
```

:::

:::details Terraform

```tf:storage.tf
resource "google_storage_bucket" "db" {
  name     = "litetodo-db" # 任意の名前
  location = "asia-northeast1"
}
```

:::

## 4. Artifact Registry リポジトリを作成

Cloud Run で使用する Docker イメージを保存するための Artifact Registry リポジトリを作成します。
今回は `litetodo` という名前で作成しました。

:::details gcloud CLI

```sh
$ gcloud artifacts repositories create "<REPOSITORY>" --location="<LOCATION>" --repository-format="docker"

# 今回の場合
$ gcloud artifacts repositories create "litetodo" --location="asia-northeast1" --repository-format="docker"
```

:::

:::details Terraform

```tf:artifact_registry.tf
# Artifact Registry のサービスを有効化
resource "google_project_service" "artifact_registry" {
  service = "artifactregistry.googleapis.com"
}

resource "google_artifact_registry_repository" "main" {
  depends_on = [google_project_service.artifact_registry]

  location      = "asia-northeast1"
  repository_id = "litetodo" # 任意の名前
  format        = "DOCKER"
}
```

:::

## 5. Docker イメージを作成

次に、Docker イメージを作成します。
今回は `Dockerfile` と `litestream.yml` と `run.sh` という 3 つのファイルを作成します。

### `Dockerfile`

まずは `Dockerfile` です。
単一の Docker イメージにアプリケーションと Litestream CLI をインストールしています。

```dockerfile:Dockerfile
FROM golang:1.21-alpine3.19 AS builder
WORKDIR /app

# Litestream CLI のバージョンを指定
ENV LITESTREAM_VERSION=v0.3.13

# Litestream CLI をインストール
ADD https://github.com/benbjohnson/litestream/releases/download/$LITESTREAM_VERSION/litestream-$LITESTREAM_VERSION-linux-amd64.tar.gz /tmp/litestream.tar.gz
RUN tar -C /usr/local/bin -xzf /tmp/litestream.tar.gz

# このあたりは今回のアプリケーションに特有の設定
ENV CGO_ENABLED=1
RUN apk add --no-cache gcc musl-dev
COPY go.mod go.sum ./
RUN go mod download
COPY main.go ./
RUN go build -o app

# ---

FROM alpine:3.19
WORKDIR /app

# アプリケーションのバイナリと Litestream CLI をコピー
COPY --from=builder /app/app ./
COPY --from=builder /usr/local/bin/litestream /usr/local/bin/litestream

# litestream の設定ファイルと実行スクリプト (後述) をコピー
COPY litestream.yml /etc/litestream.yml
COPY run.sh ./

# 起動スクリプトを実行する
CMD ["/app/run.sh"]
```

### `litestream.yml`

続いて `litestream.yml` です。
このファイルは Litestream の設定ファイルとして使用され、データベースファイルのレプリケート先などを指定します。

今回は次のように設定しました。

```yaml:litestream.yml
dbs:
  - path: /app/todo.db # データベースファイルのローカルパス
    # レプリケート先
    replicas:
      # この設定により gs://litetodo-db/todo.db にデータベースファイルがレプリケートされる
      - type: gcs # レプリケート先のタイプ
        bucket: litetodo-db # バケット名
        path: todo.db # レプリケート先のパス
```

:::message

Litestream の設定ファイルについて詳しくは以下のページをご参照ください。

- [Configuration File - Litestream](https://litestream.io/reference/config/)

:::

:::message

今回はレプリケート先に Google Cloud Storage を使用していますが、 Litestream は他にも Amazon S3 や Azure Blob Storage など様々なストレージサービスに対応しています。
詳しくは以下のページをご参照ください。

- [How-To Guides - Litestream](https://litestream.io/guides/#replica-guides)

:::

### `run.sh`

最後に `run.sh` です。
これはコンテナが起動した際に実行されるスクリプトで、アプリケーションの起動と同時にデータベースファイルの復元やレプリケートの開始を行います。
ここでは主に `litestream restore` コマンドと `litestream replicate` コマンドを使用しています。

- `litestream restore`
  - 任意のストレージ ( 今回の場合は Google Cloud Storage ) からデータベースファイルをローカルに復元するコマンド。
- `litestream replicate`
  - SQLite の DB を監視し、継続的にストレージサービスにレプリケートするコマンド。
  - `-exec` フラグにアプリケーションの起動コマンドを指定することで、データベースファイルのレプリケートとアプリケーションの起動を同時に行うことができます。

```sh:run.sh
#!/bin/sh

set -e

# もしローカルに古いデータベースファイルが存在していたら削除する
rm -f /app/todo.db

# Google Cloud Storage からデータベースファイルを復元する
# 引数には復元先のローカルのデータベースファイルのパスを指定する (今回は `/app/todo.db` としている)
# `-if-replica-exists` フラグを指定すると、レプリカが存在する場合にのみ復元を行う
# これを指定しないと、まだレプリカが存在しない場合 ( = 初回起動時 ) にエラーが発生する
# `-config` フラグに設定ファイルのパスを指定する
litestream restore -if-replica-exists -config /etc/litestream.yml /app/todo.db

# Google Cloud Storage にデータベースファイルをレプリケートしてアプリケーションを起動する
# `-exec` フラグにアプリケーションの起動コマンドを指定する (今回はアプリケーションのバイナリのパスを指定している)
# `-config` フラグに設定ファイルのパスを指定する
litestream replicate -exec /app/app -config /etc/litestream.yml
```

:::message

`litestream restore` と `litestream replicate` についての詳細は以下のページをご参照ください。

- [Command: replicate - Litestream](https://litestream.io/reference/replicate/)
- [Command: restore - Litestream](https://litestream.io/reference/restore/)

:::

---

これらのファイルを作成したら、次のコマンドを実行して Docker イメージをビルドし、 Artifact Registry にプッシュします。

```sh
# gcloud CLI を使用して Artifact Registry にログイン
$ gcloud auth configure-docker <LOCATION>-docker.pkg.dev --quiet

# Docker イメージをビルド
$ docker build --platform=linux/amd64 --tag <LOCATION>-docker.pkg.dev/<PROJECT_ID>/<REPOSITORY>/<IMAGE>:latest .

# Artifact Registry にプッシュ
$ docker push <LOCATION>-docker.pkg.dev/<PROJECT_ID>/<REPOSITORY>/<IMAGE>:latest
```

```sh
# 今回の場合
$ gcloud auth configure-docker asia-northeast1-docker.pkg.dev --quiet
$ docker build --platform=linux/amd64 --tag asia-northeast1-docker.pkg.dev/litetodo/litetodo/app:latest .
$ docker push asia-northeast1-docker.pkg.dev/litetodo/litetodo/app:latest
```

:::message

今回は単一の Docker イメージにアプリケーションと Litestream を含めましたが、 Litestream をサイドカーコンテナとして使用することもできます。
詳しくは以下のページをご参照ください。

- [Running in a Docker container - Litestream](https://litestream.io/guides/docker/#running-as-a-sidecar)

[公式の Docker イメージ](https://hub.docker.com/r/litestream/litestream)も提供されています。

:::

## 6. Cloud Run で使用するサービスアカウントを作成

Cloud Run で使用するサービスアカウントを作成します。
今回は `litetodo-app` という ID で作成しました。

また、 Litestream が Google Cloud Storage に読み書きできるようにするために、このサービスアカウントに `roles/storage.admin` の権限を付与する必要があります。

https://litestream.io/guides/gcs/#create-a-service-account

:::details gcloud CLI

```sh
$ gcloud iam service-accounts create "<SERVICE_ACCOUNT_ID>"
$ gcloud projects add-iam-policy-binding "<PROJECT_ID>" --member="serviceAccount:<SERVICE_ACCOUNT_ID>@<PROJECT_ID>.iam.gserviceaccount.com" --role="roles/storage.admin"

# 今回の場合
$ gcloud iam service-accounts create "litetodo-app"
$ gcloud projects add-iam-policy-binding "litetodo" --member="serviceAccount:litetodo-app@litetodo.iam.gserviceaccount.com" --role="roles/storage.admin"
```

:::

:::details Terraform

```tf:service_account.tf
resource "google_service_account" "app" {
  account_id = "litetodo-app" # 任意の ID
}

# サービスアカウントに roles/storage.admin の権限を付与
resource "google_project_iam_member" "app_storage_admin" {
  project = "litetodo" # プロジェクト ID
  role    = "roles/storage.admin"
  member  = "serviceAccount:${google_service_account.app.email}"
}
```

:::

## 7. Cloud Run にアプリケーションをデプロイ

Cloud Run サービスを作成してアプリケーションをデプロイしていきます。
今回は `litetodo-app` という名前で作成しました。

イメージには「[5. Docker イメージを作成](#5.-docker-イメージを作成)」手順で作成した Docker イメージを指定します。
サービスアカウントには「[6. Cloud Run で使用するサービスアカウントを作成](#6.-cloud-run-で使用するサービスアカウントを作成)」で作成したサービスアカウントを指定します。

また、**最大インスタンス数は 1 に設定する必要がある**ことに注意してください。
( 理由については「[制限事項](#制限事項)」で説明します。 )

:::details gcloud CLI

```sh
$ gcloud run deploy "<SERVICE_NAME>" \
    --region="<REGION>" \
    --image="<LOCATION>-docker.pkg.dev/<PROJECT_ID>/<REPOSITORY>/<IMAGE>:latest" \
    --port="<PORT>" \
    --service-account=<SERVICE_ACCOUNT_ID>@<PROJECT_ID>.iam.gserviceaccount.com \
    --max-instances=1 \
    --allow-unauthenticated

# 今回の場合
$ gcloud run deploy "litetodo-app" \
    --region="asia-northeast1" \
    --image="asia-northeast1-docker.pkg.dev/litetodo/litetodo/app:latest" \
    --port="8080" \
    --service-account="litetodo-app@litetodo.iam.gserviceaccount.com" \
    --max-instances=1 \
    --allow-unauthenticated
```

デプロイが完了すると Cloud Run の URL が出力されるので、「[動作確認してみる](#動作確認してみる)」ではこの URL を使用して動作確認を行います。

:::

:::details Terraform

```tf:cloud_run.tf
# Cloud Run のサービスを有効化
resource "google_project_service" "cloud_run" {
  service = "run.googleapis.com"
}

resource "google_cloud_run_v2_service" "main" {
  depends_on = [google_project_service.cloud_run]

  name     = "litetodo-app" # 任意の名前
  location = "asia-northeast1"
  ingress  = "INGRESS_TRAFFIC_ALL" # すべてのトラフィックを受け入れる

  template {
    # 先ほど作成したサービスアカウントを指定
    service_account = google_service_account.app.email # "<SERVICE_ACCOUNT_ID>@<PROJECT_ID>.iam.gserviceaccount.com"

    scaling {
      # 最大インスタンス数を 1 に設定する
      max_instance_count = 1
    }

    containers {
      image = "${google_artifact_registry_repository.main.location}-docker.pkg.dev/litetodo/${google_artifact_registry_repository.main.name}/app:latest" # "<LOCATION>-docker.pkg.dev/<PROJECT_ID>/<REPOSITORY>/<IMAGE>:latest"
      ports {
        container_port = 8080 # アプリケーションのポート番号を指定
      }
    }
  }
}

# 誰からでもアクセスできるようにする
resource "google_cloud_run_service_iam_policy" "cloud_run_noauth" {
  location    = google_cloud_run_v2_service.main.location
  project     = google_cloud_run_v2_service.main.project
  service     = google_cloud_run_v2_service.main.name
  policy_data = data.google_iam_policy.cloud_run_noauth.policy_data
}

data "google_iam_role" "run_invoker" {
  name = "roles/run.invoker"
}

data "google_iam_policy" "cloud_run_noauth" {
  binding {
    role    = data.google_iam_role.run_invoker.name
    members = ["allUsers"]
  }
}

# Cloud Run の URL を出力
output "url" {
  value = google_cloud_run_v2_service.main.uri
}
```

デプロイが完了すると Output として Cloud Run の URL が出力されるので、「[動作確認してみる](#動作確認してみる)」ではこの URL を使用して動作確認を行います。

:::

# 動作確認してみる

それでは実際に Cloud Run にデプロイした Web サービスを動作確認してみます。

:::details データを書き込み

```sh
$ curl -X POST https://****.run.app/tasks -H 'Content-Type: application/json' --data '{ "title": "aaa" }'
{
  "id": 1,
  "title": "aaa",
  "completed": false,
  "created_at": "2024-02-03T13:51:15.316447199Z",
  "updated_at": "2024-02-03T13:51:15.316447199Z"
}

$ curl -X POST https://****.run.app/tasks -H 'Content-Type: application/json' --data '{ "title": "bbb" }'
{
  "id": 2,
  "title": "bbb",
  "completed": false,
  "created_at": "2024-02-03T13:51:53.246847499Z",
  "updated_at": "2024-02-03T13:51:53.246847499Z"
}

$ curl -X POST https://****.run.app/tasks -H 'Content-Type: application/json' --data '{ "title": "ccc" }'
{
  "id": 3,
  "title": "ccc",
  "completed": false,
  "created_at": "2024-02-03T13:52:04.812745253Z",
  "updated_at": "2024-02-03T13:52:04.812745253Z"
}
```

:::

:::details データを読み込み

```sh
$ curl https://****.run.app/tasks
[
  {
    "id": 1,
    "title": "aaa",
    "completed": false,
    "created_at": "2024-02-03T13:51:15.316447199Z",
    "updated_at": "2024-02-03T13:51:15.316447199Z"
  },
  {
    "id": 2,
    "title": "bbb",
    "completed": false,
    "created_at": "2024-02-03T13:51:53.246847499Z",
    "updated_at": "2024-02-03T13:51:53.246847499Z"
  },
  {
    "id": 3,
    "title": "ccc",
    "completed": false,
    "created_at": "2024-02-03T13:52:04.812745253Z",
    "updated_at": "2024-02-03T13:52:04.812745253Z"
  }
]
```

:::

すると、 Cloud Storage バケットに色々とファイルが作成されていることが確認できます。

```sh
$ gcloud storage ls --recursive 'gs://litetodo-db/**'
gs://litetodo-db/todo.db/generations/4bf1e2d97682981d/snapshots/00000000.snapshot.lz4
gs://litetodo-db/todo.db/generations/4bf1e2d97682981d/wal/00000000_00000000.wal.lz4
gs://litetodo-db/todo.db/generations/4bf1e2d97682981d/wal/00000001_00000000.wal.lz4
gs://litetodo-db/todo.db/generations/4bf1e2d97682981d/wal/00000001_00001038.wal.lz4
gs://litetodo-db/todo.db/generations/4bf1e2d97682981d/wal/00000002_00000000.wal.lz4
gs://litetodo-db/todo.db/generations/4bf1e2d97682981d/wal/00000002_00001038.wal.lz4
gs://litetodo-db/todo.db/generations/4bf1e2d97682981d/wal/00000002_00003068.wal.lz4
gs://litetodo-db/todo.db/generations/4bf1e2d97682981d/wal/00000003_00000000.wal.lz4
```

しばらく待ってから ( = Cloud Run のコンテナが破棄されてから ) 再度データを読み込んでみても、以前書き込んだデータが返ってきます。
このように、 Cloud Run のコンテナが再起動された後も**データが永続化されている**ことが確認できます。

```sh
$ curl https://****.run.app/tasks
[
  {
    "id": 1,
    "title": "aaa",
    "completed": false,
    "created_at": "2024-02-03T13:51:15.316447199Z",
    "updated_at": "2024-02-03T13:51:15.316447199Z"
  },
  # ...省略
]
```

# 制限事項

Litestream はローカルの SQLite のデータベースファイルを監視してリアルタイムにオブジェクトストレージにレプリケートすることはできますが、逆に**オブジェクトストレージのデータを監視してローカルの SQLite のデータベースファイルにリアルタイムに復元する**というようなことは**できません**。
そのため、同時に複数のインスタンスから Litestream を使用してレプリケートを行うと、データの整合性が保てなくなったり競合などの問題が発生する可能性があります。
それを防止するために Cloud Run で Litestream を使用する場合は最大インスタンス数を 1 に設定して**複数インスタンスが同時に起動されないようにする**必要があります。
つまり**スケールアウトができない**ので、多くのリクエストを捌くためには**インスタンスの CPU やメモリを上げる** ( = スケールアップ ) 等の対応が必要になります。

また、 Litestream は復元時に Google Cloud Storage からデータをダウンロードするため、**データ量が多くなるほど復元に時間がかかる** ( = **コンテナを起動するのに時間がかかる** ) という問題もあります。

これらの事項を考慮すると、 Cloud Run + Litestream の組み合わせを使用できるのはあくまでアクセス数やデータ量の少ない**小規模なアプリケーション**に限られるということになります。
とはいえやはり RDB を使いつつ費用を安く抑えることができるというのは大きなメリットなので、個人開発やプロトタイプの開発などであれば**十分に有用な構成**だと思います。

# おまけ

ちなみに Litestream と同じ人が開発している [LiteFS](https://github.com/superfly/litefs) というプロジェクトもあります。
Litestream がディザスタリカバリを主な目的としているのに対して、 LiteFS は高可用性と低いグローバル遅延が重要な環境を対象としているようです。
こちらも気になるのでそのうち試してみたいです。

https://github.com/superfly/litefs
https://litestream.io/alternatives/#litefs

# まとめ

思ってたよりサックリできました。
Cloud Run はアプリケーションの実行環境として本当に使いやすい & 安くて便利なので、さらに Litestream で RDB のコスト問題も解決すれば ( ある程度の制限はあるものの ) 個人開発が捗ること間違いなしですね。

安さこそ正義！

# 参考

https://litestream.io/guides
https://qiita.com/faable01/items/ac7418d671c6db5b966f
