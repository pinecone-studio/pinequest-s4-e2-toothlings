type SidebarBadgeProps = { count: number }

const SidebarBadge = ({ count }: SidebarBadgeProps) => (
  <span className="ml-auto shrink-0 rounded-full bg-triage-red px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
    {count > 99 ? '99+' : count}
  </span>
)

export default SidebarBadge
