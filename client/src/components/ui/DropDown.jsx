import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown } from "lucide-react";
import clsx from "clsx";

export function SelectDropdown({
  label = "Select",
  value,
  options = [],
  onChange,
  placeholder = "Select option",
  className = "",
}) {
  const selected = options.find((item) => item.value === value);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={clsx(
            "flex h-[46px] min-w-[180px] items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 text-left text-sm text-slate-700 shadow-sm outline-none transition hover:bg-slate-50 focus:border-[#5e6ad2]/70 focus:ring-4 focus:ring-[#5e6ad2]/10",
            className
          )}
        >
          <span className="truncate">{selected?.label || placeholder || label}</span>
          <ChevronDown size={16} className="shrink-0 text-slate-400" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          align="start"
          className="z-[200] min-w-[220px] overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-2xl shadow-slate-200/80"
        >
          {options.map((item) => (
            <DropdownMenu.Item
              key={item.value}
              disabled={item.disabled}
              onSelect={() => onChange(item.value)}
              className={clsx(
                "flex cursor-pointer select-none items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none transition hover:bg-slate-50 focus:bg-slate-50",
                item.disabled && "pointer-events-none opacity-40"
              )}
            >
              <span>{item.label}</span>
              {value === item.value && (
                <Check size={15} className="text-[#5e6ad2]" />
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}