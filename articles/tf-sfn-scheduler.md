---
title: "【Terraform】EventBridge Scheduler で Step Functions を定期実行する"
emoji: "🕑"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["terraform", "aws"]
published: true
published_at: 2024-02-13 18:00
---

備忘録！

# サンプルコード

https://github.com/koki-develop/sfn-scheduler-example

# 手順

## 1. Step Functions State Machine を作成する

とりあえず適当な State Machine を作成します。

```tf:sfn.tf
resource "aws_sfn_state_machine" "main" {
  name     = "example-state-machine"
  role_arn = aws_iam_role.sfn.arn

  # Hello, World するだけ
  definition = jsonencode({
    StartAt = "Hello"
    States = {
      Hello = {
        Type   = "Pass"
        Result = "Hello, World!"
        End    = true
      }
    }
  })
}

resource "aws_iam_role" "sfn" {
  name               = "example-sfn-role"
  assume_role_policy = data.aws_iam_policy_document.sfn_assume_role_policy.json
}

data "aws_iam_policy_document" "sfn_assume_role_policy" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["states.amazonaws.com"]
    }
  }
}
```

## 2. EventBridge Scheduler 用の IAM Role を作成する

続いて EventBridge Scheduler にアタッチする IAM Role を作成します。
Step Functions を実行するために `states:StartExecution` アクションを許可する必要があります。

```tf:iam.tf
resource "aws_iam_role" "scheduler" {
  name               = "example-scheduler-role"
  assume_role_policy = data.aws_iam_policy_document.scheduler_assume_role_policy.json
}

data "aws_iam_policy_document" "scheduler_assume_role_policy" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["scheduler.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy" "scheduler" {
  role   = aws_iam_role.scheduler.name
  name   = "scheduler-policy"
  policy = data.aws_iam_policy_document.scheduler_policy.json
}

# Step Functions の実行権限を付与
data "aws_iam_policy_document" "scheduler_policy" {
  statement {
    effect    = "Allow"
    actions   = ["states:StartExecution"]
    resources = [aws_sfn_state_machine.main.arn]
  }
}
```

### 3. EventBridge Scheduler を作成する

最後に Step Functions を定期実行する Scheduler を作成します。
今回は 30 分ごとに実行するように設定してみます。

```tf:scheduler.tf
resource "aws_scheduler_schedule" "main" {
  name = "example-schedule"

  # 任意のスケジュール (今回は 30 分ごと)
  schedule_expression = "rate(30 minutes)"

  target {
    # 定期実行する Step Functions State Machine の ARN を指定
    arn = aws_sfn_state_machine.main.arn

    # 先ほど作成した EventBridge Scheduler 用の IAM Role の ARN を指定
    role_arn = aws_iam_role.scheduler.arn

    # Step Functions に Input を渡す場合はここで指定できる
    input = jsonencode({
      hoge = "fuga"
    })
  }

  # Flexible Time Window を設定する場合はここでする (今回はオフ)
  # 参考: https://docs.aws.amazon.com/scheduler/latest/UserGuide/managing-schedule-flexible-time-windows.html
  flexible_time_window {
    mode = "OFF"
  }
}
```

# 確認

Step Functions State Machine の実行履歴を見ると、設定したスケジュールで定期実行されていることが確認できます。

![](/images/tf-sfn-scheduler/logs.png)

# 参考

https://docs.aws.amazon.com/ja_jp/step-functions/latest/dg/using-eventbridge-scheduler.html
