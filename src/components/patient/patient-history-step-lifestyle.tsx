import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type {
  SmokingInfo,
  AlcoholInfo,
  DrivingInfo,
  SportsInfo,
} from "@/data/mock-patients"

export interface LifestyleData {
  smokingInfo: SmokingInfo
  alcoholInfo: AlcoholInfo
  screenTimeComputer: string
  screenTimePhone: string
  outdoorTime: string
  sunglassesUse: string
  workNearVision: boolean
  workDustyChemical: boolean
  drivingInfo: DrivingInfo
  sportsInfo: SportsInfo
  hobbies: string
}

interface Props {
  data: LifestyleData
  onChange: (data: LifestyleData) => void
}

const SCREEN_TIME_OPTIONS = [
  { value: "", label: "-- Chọn --" },
  { value: "duoi_2h", label: "< 2 giờ" },
  { value: "2_4h", label: "2-4 giờ" },
  { value: "4_8h", label: "4-8 giờ" },
  { value: "tren_8h", label: "> 8 giờ" },
]

const OUTDOOR_TIME_OPTIONS = [
  { value: "", label: "-- Chọn --" },
  { value: "duoi_30p", label: "< 30 phút" },
  { value: "30_60p", label: "30-60 phút" },
  { value: "1_2h", label: "1-2 giờ" },
  { value: "tren_2h", label: "> 2 giờ" },
]

export function PatientHistoryStepLifestyle({ data, onChange }: Props) {
  function updateSmoking(updates: Partial<SmokingInfo>) {
    onChange({
      ...data,
      smokingInfo: { ...data.smokingInfo, ...updates },
    })
  }

  function updateAlcohol(updates: Partial<AlcoholInfo>) {
    onChange({
      ...data,
      alcoholInfo: { ...data.alcoholInfo, ...updates },
    })
  }

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold">
        Lối sống và thói quen sinh hoạt
      </h2>

      {/* Smoking */}
      <fieldset className="space-y-1">
        <legend className="text-base font-medium">Hút thuốc</legend>
        <div className="space-y-1">
          <label className="flex items-center gap-3 py-2.5 text-base">
            <input
              type="radio"
              name="smoking"
              checked={data.smokingInfo.status === "khong"}
              onChange={() =>
                onChange({
                  ...data,
                  smokingInfo: { status: "khong" },
                })
              }
              className="size-4 accent-[var(--color-primary)]"
            />
            <span>Không</span>
          </label>
          <label className="flex items-center gap-3 py-2.5 text-base">
            <input
              type="radio"
              name="smoking"
              checked={data.smokingInfo.status === "co"}
              onChange={() =>
                onChange({
                  ...data,
                  smokingInfo: { status: "co" },
                })
              }
              className="size-4 accent-[var(--color-primary)]"
            />
            <span>Có</span>
          </label>
          <label className="flex items-center gap-3 py-2.5 text-base">
            <input
              type="radio"
              name="smoking"
              checked={data.smokingInfo.status === "da_bo"}
              onChange={() =>
                onChange({
                  ...data,
                  smokingInfo: { status: "da_bo" },
                })
              }
              className="size-4 accent-[var(--color-primary)]"
            />
            <span>Đã bỏ</span>
          </label>
        </div>

        {data.smokingInfo.status === "co" && (
          <div className="ml-6 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="smoking-quantity" className="text-base">
                Số lượng (điếu/ngày)
              </Label>
              <Input
                id="smoking-quantity"
                value={data.smokingInfo.quantity ?? ""}
                onChange={(e) => updateSmoking({ quantity: e.target.value })}
                placeholder="VD: 10 điếu/ngày"
                className="text-base"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="smoking-years" className="text-base">
                Số năm hút
              </Label>
              <Input
                id="smoking-years"
                value={data.smokingInfo.years ?? ""}
                onChange={(e) => updateSmoking({ years: e.target.value })}
                placeholder="VD: 5 năm"
                className="text-base"
              />
            </div>
          </div>
        )}

        {data.smokingInfo.status === "da_bo" && (
          <div className="ml-6 space-y-1.5">
            <Label htmlFor="smoking-quit-year" className="text-base">
              Năm bỏ
            </Label>
            <Input
              id="smoking-quit-year"
              value={data.smokingInfo.quitYear ?? ""}
              onChange={(e) => updateSmoking({ quitYear: e.target.value })}
              placeholder="VD: 2020"
              className="text-base"
            />
          </div>
        )}
      </fieldset>

      {/* Alcohol */}
      <fieldset className="space-y-1">
        <legend className="text-base font-medium">Uống rượu bia</legend>
        <div className="space-y-1">
          <label className="flex items-center gap-3 py-2.5 text-base">
            <input
              type="radio"
              name="alcohol"
              checked={data.alcoholInfo.status === "khong"}
              onChange={() =>
                onChange({
                  ...data,
                  alcoholInfo: { status: "khong" },
                })
              }
              className="size-4 accent-[var(--color-primary)]"
            />
            <span>Không</span>
          </label>
          <label className="flex items-center gap-3 py-2.5 text-base">
            <input
              type="radio"
              name="alcohol"
              checked={data.alcoholInfo.status === "thinh_thoang"}
              onChange={() =>
                onChange({
                  ...data,
                  alcoholInfo: { status: "thinh_thoang" },
                })
              }
              className="size-4 accent-[var(--color-primary)]"
            />
            <span>Thỉnh thoảng</span>
          </label>
          <label className="flex items-center gap-3 py-2.5 text-base">
            <input
              type="radio"
              name="alcohol"
              checked={data.alcoholInfo.status === "thuong_xuyen"}
              onChange={() =>
                onChange({
                  ...data,
                  alcoholInfo: { status: "thuong_xuyen" },
                })
              }
              className="size-4 accent-[var(--color-primary)]"
            />
            <span>Thường xuyên</span>
          </label>
        </div>

        {data.alcoholInfo.status === "thuong_xuyen" && (
          <div className="ml-6 space-y-1.5">
            <Label htmlFor="alcohol-frequency" className="text-base">
              Tần suất
            </Label>
            <Input
              id="alcohol-frequency"
              value={data.alcoholInfo.frequency ?? ""}
              onChange={(e) => updateAlcohol({ frequency: e.target.value })}
              placeholder="VD: 3-4 lần/tuần"
              className="text-base"
            />
          </div>
        )}
      </fieldset>

      {/* Screen time - computer */}
      <div className="space-y-1.5">
        <Label htmlFor="screen-time-computer" className="text-base">
          Thời gian sử dụng máy tính
        </Label>
        <select
          id="screen-time-computer"
          value={data.screenTimeComputer}
          onChange={(e) =>
            onChange({ ...data, screenTimeComputer: e.target.value })
          }
          className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {SCREEN_TIME_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Screen time - phone */}
      <div className="space-y-1.5">
        <Label htmlFor="screen-time-phone" className="text-base">
          Thời gian sử dụng điện thoại
        </Label>
        <select
          id="screen-time-phone"
          value={data.screenTimePhone}
          onChange={(e) =>
            onChange({ ...data, screenTimePhone: e.target.value })
          }
          className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {SCREEN_TIME_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Outdoor time */}
      <div className="space-y-1.5">
        <Label htmlFor="outdoor-time" className="text-base">
          Thời gian hoạt động ngoài trời
        </Label>
        <select
          id="outdoor-time"
          value={data.outdoorTime}
          onChange={(e) =>
            onChange({ ...data, outdoorTime: e.target.value })
          }
          className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {OUTDOOR_TIME_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sunglasses use */}
      <fieldset className="space-y-1">
        <legend className="text-base font-medium">Sử dụng kính râm</legend>
        <div className="space-y-1">
          <label className="flex items-center gap-3 py-2.5 text-base">
            <input
              type="radio"
              name="sunglasses"
              checked={data.sunglassesUse === "luon_luon"}
              onChange={() =>
                onChange({ ...data, sunglassesUse: "luon_luon" })
              }
              className="size-4 accent-[var(--color-primary)]"
            />
            <span>Luôn luôn</span>
          </label>
          <label className="flex items-center gap-3 py-2.5 text-base">
            <input
              type="radio"
              name="sunglasses"
              checked={data.sunglassesUse === "thinh_thoang"}
              onChange={() =>
                onChange({ ...data, sunglassesUse: "thinh_thoang" })
              }
              className="size-4 accent-[var(--color-primary)]"
            />
            <span>Thỉnh thoảng</span>
          </label>
          <label className="flex items-center gap-3 py-2.5 text-base">
            <input
              type="radio"
              name="sunglasses"
              checked={data.sunglassesUse === "khong_bao_gio"}
              onChange={() =>
                onChange({ ...data, sunglassesUse: "khong_bao_gio" })
              }
              className="size-4 accent-[var(--color-primary)]"
            />
            <span>Không bao giờ</span>
          </label>
        </div>
      </fieldset>

      {/* Work near vision */}
      <div>
        <label className="flex items-center gap-2.5 py-2.5 text-base">
          <input
            type="checkbox"
            checked={data.workNearVision}
            onChange={() =>
              onChange({ ...data, workNearVision: !data.workNearVision })
            }
            className="size-4 accent-[var(--color-primary)]"
          />
          Công việc yêu cầu nhìn gần nhiều
        </label>
      </div>

      {/* Work dusty/chemical */}
      <div>
        <label className="flex items-center gap-2.5 py-2.5 text-base">
          <input
            type="checkbox"
            checked={data.workDustyChemical}
            onChange={() =>
              onChange({
                ...data,
                workDustyChemical: !data.workDustyChemical,
              })
            }
            className="size-4 accent-[var(--color-primary)]"
          />
          Làm việc trong môi trường bụi/hóa chất
        </label>
      </div>

      {/* Driving */}
      <fieldset className="space-y-1">
        <legend className="text-base font-medium">Lái xe</legend>
        <label className="flex items-center gap-2.5 py-2.5 text-base">
          <input
            type="checkbox"
            checked={data.drivingInfo.does}
            onChange={() =>
              onChange({
                ...data,
                drivingInfo: {
                  does: !data.drivingInfo.does,
                  when: !data.drivingInfo.does
                    ? data.drivingInfo.when
                    : undefined,
                },
              })
            }
            className="size-4 accent-[var(--color-primary)]"
          />
          Có lái xe
        </label>

        {data.drivingInfo.does && (
          <div className="ml-6 space-y-1">
            <label className="flex items-center gap-3 py-2.5 text-base">
              <input
                type="radio"
                name="driving-when"
                checked={data.drivingInfo.when === "ban_ngay"}
                onChange={() =>
                  onChange({
                    ...data,
                    drivingInfo: { does: true, when: "ban_ngay" },
                  })
                }
                className="size-4 accent-[var(--color-primary)]"
              />
              <span>Ban ngày</span>
            </label>
            <label className="flex items-center gap-3 py-2.5 text-base">
              <input
                type="radio"
                name="driving-when"
                checked={data.drivingInfo.when === "ban_dem"}
                onChange={() =>
                  onChange({
                    ...data,
                    drivingInfo: { does: true, when: "ban_dem" },
                  })
                }
                className="size-4 accent-[var(--color-primary)]"
              />
              <span>Ban đêm</span>
            </label>
            <label className="flex items-center gap-3 py-2.5 text-base">
              <input
                type="radio"
                name="driving-when"
                checked={data.drivingInfo.when === "ca_hai"}
                onChange={() =>
                  onChange({
                    ...data,
                    drivingInfo: { does: true, when: "ca_hai" },
                  })
                }
                className="size-4 accent-[var(--color-primary)]"
              />
              <span>Cả hai</span>
            </label>
          </div>
        )}
      </fieldset>

      {/* Sports */}
      <fieldset className="space-y-1">
        <legend className="text-base font-medium">Thể thao</legend>
        <label className="flex items-center gap-2.5 py-2.5 text-base">
          <input
            type="checkbox"
            checked={data.sportsInfo.does}
            onChange={() =>
              onChange({
                ...data,
                sportsInfo: {
                  does: !data.sportsInfo.does,
                  type: !data.sportsInfo.does
                    ? data.sportsInfo.type
                    : undefined,
                },
              })
            }
            className="size-4 accent-[var(--color-primary)]"
          />
          Có chơi thể thao
        </label>

        {data.sportsInfo.does && (
          <div className="ml-6 space-y-1.5">
            <Label htmlFor="sports-type" className="text-base">
              Loại thể thao
            </Label>
            <Input
              id="sports-type"
              value={data.sportsInfo.type ?? ""}
              onChange={(e) =>
                onChange({
                  ...data,
                  sportsInfo: { does: true, type: e.target.value },
                })
              }
              placeholder="VD: Bơi, cầu lông, bóng đá..."
              className="text-base"
            />
          </div>
        )}
      </fieldset>

      {/* Hobbies */}
      <div className="space-y-1.5">
        <Label htmlFor="hobbies" className="text-base">
          Sở thích
        </Label>
        <Input
          id="hobbies"
          value={data.hobbies}
          onChange={(e) => onChange({ ...data, hobbies: e.target.value })}
          placeholder="VD: Đọc sách, chơi game, làm vườn..."
          className="text-base"
        />
      </div>
    </div>
  )
}
