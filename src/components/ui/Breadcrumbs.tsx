import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

export function Breadcrumbs({ items, className = "", showHome = true }: BreadcrumbsProps) {
  const allItems: BreadcrumbItem[] = showHome
    ? [{ label: "Workspace", href: "/" }, ...items]
    : items;

  return (
    <nav
      aria-label="Breadcrumbs"
      className={`flex items-center text-xs text-zinc-500 dark:text-zinc-400 ${className}`}
    >
      <ol
        className="flex items-center flex-wrap gap-1.5"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const position = index + 1;

          return (
            <li
              key={index}
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
              className="flex items-center gap-1.5"
            >
              {index > 0 && (
                <ChevronRight
                  className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600 shrink-0"
                  aria-hidden="true"
                />
              )}

              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  itemProp="item"
                  className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1"
                >
                  {index === 0 && showHome && (
                    <Home className="w-3 h-3 text-zinc-400 dark:text-zinc-500" aria-hidden="true" />
                  )}
                  <span itemProp="name">{item.label}</span>
                </Link>
              ) : (
                <span
                  itemProp="name"
                  aria-current={isLast ? "page" : undefined}
                  className="font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-xs sm:max-w-md"
                >
                  {item.label}
                </span>
              )}

              <meta itemProp="position" content={String(position)} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
