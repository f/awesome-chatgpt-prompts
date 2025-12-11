"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { X, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  id: string;
  username: string;
  name: string | null;
  avatar: string | null;
}

interface ContributorSearchProps {
  selectedUsers: User[];
  onSelect: (user: User) => void;
  onRemove: (userId: string) => void;
}

export function ContributorSearch({ selectedUsers, onSelect, onRemove }: ContributorSearchProps) {
  const t = useTranslations("prompts");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if dropdown should open upward
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 200; // Approximate max height
      setOpenUpward(spaceBelow < dropdownHeight && rect.top > dropdownHeight);
    }
  }, [isOpen, results]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (query.length < 1) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          // Filter out already selected users
          const filtered = data.filter(
            (user: User) => !selectedUsers.some((s) => s.id === user.id)
          );
          setResults(filtered);
        }
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [query, selectedUsers]);

  const handleSelect = (user: User) => {
    onSelect(user);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* Selected contributors */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full bg-muted text-sm"
            >
              <Avatar className="h-5 w-5">
                <AvatarImage src={user.avatar || undefined} />
                <AvatarFallback className="text-[10px]">
                  {user.name?.[0] || user.username[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">@{user.username}</span>
              <button
                type="button"
                onClick={() => onRemove(user.id)}
                className="ml-0.5 p-0.5 rounded-full hover:bg-foreground/10"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative" ref={containerRef}>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={t("searchContributors")}
            className="pl-8 h-9"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            data-1p-ignore
            data-lpignore="true"
            data-form-type="other"
          />
          {isLoading && (
            <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Dropdown */}
        {isOpen && results.length > 0 && (
          <div
            ref={dropdownRef}
            className={`absolute z-50 w-full rounded-md border bg-popover shadow-md max-h-[200px] overflow-y-auto ${
              openUpward ? "bottom-full mb-1" : "top-full mt-1"
            }`}
          >
            {results.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleSelect(user)}
                className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-accent transition-colors first:rounded-t-md last:rounded-b-md"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.avatar || undefined} />
                  <AvatarFallback className="text-xs">
                    {user.name?.[0] || user.username[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">@{user.username}</div>
                  {user.name && (
                    <div className="text-xs text-muted-foreground truncate">{user.name}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {isOpen && query.length >= 1 && !isLoading && results.length === 0 && (
          <div className={`absolute z-50 w-full rounded-md border bg-popover shadow-md p-3 text-sm text-muted-foreground text-center ${
            openUpward ? "bottom-full mb-1" : "top-full mt-1"
          }`}>
            {t("noUsersFound")}
          </div>
        )}
      </div>
    </div>
  );
}
