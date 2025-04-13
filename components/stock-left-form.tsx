"use client"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { addStockLeft } from "@/app/actions/stock-left"
import type { FishType } from "@/types/stock"
import { useRouter } from "next/navigation"

interface StockItem {
  fishType: FishType
  currentStock: number
}

interface StockLeftFormProps {
  stockItems: StockItem[]
}

const formSchema = z.object({
  date: z.date({
    required_error: "Please select a date.",
  }),
  time: z.string({
    required_error: "Please enter the time.",
  }),
  stockLeft: z.record(z.string(), z.coerce.number().min(0, "Stock cannot be negative").default(0)),
  notes: z.string().optional(),
})

export default function StockLeftForm({ stockItems }: StockLeftFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      time: format(new Date(), "HH:mm"),
      stockLeft: stockItems.reduce(
        (acc, item) => {
          acc[item.fishType.id] = 0
          return acc
        },
        {} as Record<string, number>,
      ),
      notes: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      // Convert form values to FormData
      const formData = new FormData()
      formData.append("date", format(values.date, "yyyy-MM-dd"))
      formData.append("time", values.time)

      if (values.notes) {
        formData.append("notes", values.notes)
      }

      // Add stock left values
      Object.entries(values.stockLeft).forEach(([fishTypeId, value]) => {
        formData.append(`stockLeft.${fishTypeId}`, value.toString())
      })

      // Submit the form data
      const result = await addStockLeft(formData)

      if (result.success) {
        toast({
          title: "End of day stock recorded",
          description: result.message,
        })

        // Refresh the page to show updated data
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <Clock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Remaining Stock</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fish Type</TableHead>
                    <TableHead>Current Stock (kg)</TableHead>
                    <TableHead>Remaining Stock (kg)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockItems.map((item) => (
                    <TableRow key={item.fishType.id}>
                      <TableCell>{item.fishType.name}</TableCell>
                      <TableCell>{item.currentStock} kg</TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`stockLeft.${item.fishType.id}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input type="number" min="0" step="0.01" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Add any additional notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Recording..." : "Record End of Day Stock"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
