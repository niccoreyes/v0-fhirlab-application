"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { TerminologySearchResult, ValidationResult } from "@/lib/terminology-api"

interface TerminologySearchProps {
  placeholder?: string
  searchFunction: (term: string) => Promise<TerminologySearchResult[]>
  validateFunction?: (code: string) => Promise<ValidationResult>
  onSelect: (item: TerminologySearchResult) => void
  value?: TerminologySearchResult | null
  disabled?: boolean
  className?: string
  required?: boolean
}

export function TerminologySearch({
  placeholder = "Search...",
  searchFunction,
  validateFunction,
  onSelect,
  value,
  disabled = false,
  className,
  required = false,
}: TerminologySearchProps) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [results, setResults] = React.useState<TerminologySearchResult[]>([])
  const [loading, setLoading] = React.useState(false)
  const [validationResult, setValidationResult] = React.useState<ValidationResult | null>(null)

  // Debounce search to avoid too many requests
  React.useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setResults([])
      return
    }

    const handler = setTimeout(async () => {
      setLoading(true)
      try {
        const searchResults = await searchFunction(searchTerm)
        setResults(searchResults)
      } catch (error) {
        console.error("Error searching terminology:", error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(handler)
  }, [searchTerm, searchFunction])

  // Validate the selected code when it changes
  React.useEffect(() => {
    if (!value || !validateFunction) return

    const validateCode = async () => {
      try {
        const result = await validateFunction(value.code)
        setValidationResult(result)
      } catch (error) {
        console.error("Error validating code:", error)
        setValidationResult({
          isValid: false,
          message: "Error validating code",
        })
      }
    }

    validateCode()
  }, [value, validateFunction])

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", className, {
              "border-red-500": required && !value,
            })}
            disabled={disabled}
          >
            {value ? value.display : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder={placeholder} value={searchTerm} onValueChange={setSearchTerm} className="h-9" />
            {loading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {!loading && (
              <CommandList>
                <CommandEmpty>
                  {searchTerm.length < 2 ? "Type at least 2 characters to search" : "No results found"}
                </CommandEmpty>
                <CommandGroup>
                  {results.map((item) => {
                    console.log("Rendering CommandItem:", {
                      value: item.value,
                      key: `${item.system}-${item.code}`,
                      display: item.display,
                      code: item.code,
                      system: item.system,
                    });
                    return (
                      <CommandItem
                        key={`${item.system}-${item.code}`}
                        value={item.value || `${item.code}-${item.display}` || item.code}
                        onMouseDown={() => {
                          console.log("CommandItem onMouseDown for:", item);
                        }}
                        onSelect={() => {
                          console.log("TerminologySearch onSelect called with:", item);
                          onSelect(item)
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value?.code === item.code && value?.system === item.system ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <div className="flex flex-col">
                          <span>{item.display}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.code} ({item.system.split("/").pop()})
                          </span>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      {validationResult && !validationResult.isValid && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{validationResult.message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
