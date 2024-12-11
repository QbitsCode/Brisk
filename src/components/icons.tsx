import {
  Moon,
  SunMedium,
  type Icon as LucideIcon,
} from "lucide-react"

export type Icon = LucideIcon

export const Icons = {
  sun: SunMedium,
  moon: Moon,
  x: ({ ...props }: React.ComponentProps<"svg">) => (
    <svg
      height="20"
      width="20"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className="text-foreground"
      {...props}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  logo: ({ ...props }: React.ComponentProps<"svg">) => (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.62 16a7.38 7.38 0 1 1 14.76 0 7.38 7.38 0 0 1-14.76 0ZM16 7.62a8.38 8.38 0 1 0 0 16.76 8.38 8.38 0 0 0 0-16.76Z"
        className="fill-current"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 13.03c.368 0 .667.299.667.667v4.606c0 .368-.299.667-.667.667-.368 0-.667-.299-.667-.667v-4.606c0-.368.299-.667.667-.667Z"
        className="fill-current"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.03 16c0-.368.299-.667.667-.667h4.606c.368 0 .667.299.667.667 0 .368-.299.667-.667.667h-4.606c-.368 0-.667-.299-.667-.667Z"
        className="fill-current"
      />
    </svg>
  ),
}
