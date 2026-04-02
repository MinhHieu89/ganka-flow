import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getOsdiSeverity } from "@/lib/osdi-utils"

interface OsdiModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialAnswers: (number | null)[]
  onSubmit: (answers: (number | null)[], score: number) => void
}

const ANSWER_OPTIONS = [
  { label: "Không bao giờ", value: 0 },
  { label: "Thỉnh thoảng", value: 1 },
  { label: "Thường xuyên", value: 2 },
  { label: "Hầu hết thời gian", value: 3 },
  { label: "Liên tục", value: 4 },
]

const QUESTION_GROUPS = [
  {
    title:
      "Trong một ngày điển hình trong 1 tuần qua, bạn có gặp phải bất kỳ triệu chứng nào của mắt dưới đây không:",
    questions: ["Chói mắt", "Nhìn mờ giữa các lần chớp mắt liên tục"],
  },
  {
    title:
      "Trong một ngày điển hình trong 1 tuần qua, các vấn đề về mắt có ảnh hưởng đến bạn chủ yếu trong việc thực hiện hoạt động nào sau đây:",
    questions: [
      "Lái xe hoặc ngồi trên xe vào ban đêm",
      "Xem tivi / thực hiện các hoạt động trên máy tính / đọc sách",
    ],
  },
  {
    title:
      "Trong một ngày điển hình trong 1 tuần qua, mắt bạn có cảm thấy khó chịu trong bất kỳ tình huống nào dưới đây không:",
    questions: [
      "Ở những nơi có gió thổi nhiều / khô bụi",
      "Ở những nơi có độ ẩm thấp hoặc có điều hòa",
    ],
  },
]

export function ScreeningStep2OsdiModal({
  open,
  onOpenChange,
  initialAnswers,
  onSubmit,
}: OsdiModalProps) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => [
    ...initialAnswers,
  ])

  // Reset answers when modal opens
  function handleOpenChange(isOpen: boolean) {
    if (isOpen) {
      setAnswers([...initialAnswers])
    }
    onOpenChange(isOpen)
  }

  function setAnswer(questionIndex: number, value: number) {
    setAnswers((prev) => {
      const next = [...prev]
      next[questionIndex] = value
      return next
    })
  }

  const answeredCount = answers.filter((a) => a !== null).length
  const totalScore = answers.reduce<number>((sum, a) => sum + (a ?? 0), 0)
  const severity = getOsdiSeverity(totalScore)

  function handleSubmit() {
    onSubmit(answers, totalScore)
    onOpenChange(false)
  }

  let questionIndex = 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl gap-0 p-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle>Bảng hỏi OSDI-6</DialogTitle>
        </DialogHeader>

        <div className="max-h-[420px] overflow-y-auto px-5">
          {QUESTION_GROUPS.map((group, gi) => (
            <div key={gi}>
              <p className="border-b border-border py-3 text-sm font-medium text-muted-foreground">
                {group.title}
              </p>
              {group.questions.map((question) => {
                const qi = questionIndex++
                return (
                  <div
                    key={qi}
                    className="border-b border-border/50 py-3 last:border-b-0"
                  >
                    <p className="mb-2 text-sm">
                      <span className="font-semibold text-primary">
                        {qi + 1}.
                      </span>{" "}
                      {question}
                    </p>
                    <div
                      className="flex flex-wrap gap-1.5"
                      role="radiogroup"
                      aria-label={question}
                    >
                      {ANSWER_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setAnswer(qi, opt.value)}
                          aria-checked={answers[qi] === opt.value}
                          role="radio"
                          className={cn(
                            "rounded-full px-3 py-1.5 text-xs transition-colors",
                            answers[qi] === opt.value
                              ? "border-2 border-primary bg-primary/5 font-semibold text-primary"
                              : "border border-border text-muted-foreground hover:bg-muted/50"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Scoring reference */}
        <div className="bg-muted/50 px-5 py-2 text-xs text-muted-foreground">
          <strong>Thang điểm tham chiếu:</strong> Không bao giờ = 0 · Thỉnh
          thoảng = 1 · Thường xuyên = 2 · Hầu hết thời gian = 3 · Liên tục = 4
        </div>

        <DialogFooter className="flex-row items-center justify-between border-t border-border px-5 py-3">
          <div className="text-sm text-muted-foreground" aria-live="polite">
            Tổng:{" "}
            <span className="text-lg font-bold text-foreground">
              {totalScore}
            </span>
            /24
            {answeredCount > 0 && (
              <span
                className={cn(
                  "ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium",
                  severity.className
                )}
              >
                {severity.label}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmit}>Ghi nhận điểm</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
