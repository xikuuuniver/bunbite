import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
// @ts-ignore
import peopleImg from '@assets/generated_images/reservation-people.jpg';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  guests: z.string().min(1, 'Number of guests is required'),
  requests: z.string().optional(),
});

export default function ReserveTable() {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      date: '',
      time: '',
      guests: '2',
      requests: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Reservation Confirmed!",
      description: `We'll see you on ${values.date} at ${values.time} for ${values.guests} guests.`,
      variant: "default",
    });
    form.reset();
  }

  return (
    <section id="reserve" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col lg:flex-row border border-primary/5">
          
          <div className="lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-4xl md:text-5xl text-primary mb-4">RESERVE YOUR TABLE</h2>
              <p className="text-foreground/80 mb-8 text-lg">
                Book your spot and enjoy fresh burgers with your crew. No waiting, just eating.
              </p>
            </motion.div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary font-medium">Full Name</FormLabel>
                        <FormControl>
                          <input 
                            {...field} 
                            placeholder="John Doe"
                            className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background/50 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                            data-testid="input-reserve-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary font-medium">Email Address</FormLabel>
                        <FormControl>
                          <input 
                            {...field} 
                            type="email"
                            placeholder="john@example.com"
                            className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background/50 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                            data-testid="input-reserve-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary font-medium">Date</FormLabel>
                        <FormControl>
                          <input 
                            {...field} 
                            type="date"
                            className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background/50 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                            data-testid="input-reserve-date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary font-medium">Time</FormLabel>
                        <FormControl>
                          <select 
                            {...field}
                            className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background/50 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all appearance-none"
                            data-testid="input-reserve-time"
                          >
                            <option value="">Select time</option>
                            <option value="10:00">10:00 AM</option>
                            <option value="12:00">12:00 PM</option>
                            <option value="14:00">2:00 PM</option>
                            <option value="16:00">4:00 PM</option>
                            <option value="18:00">6:00 PM</option>
                            <option value="20:00">8:00 PM</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="guests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary font-medium">Guests</FormLabel>
                        <FormControl>
                          <select 
                            {...field}
                            className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background/50 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all appearance-none"
                            data-testid="input-reserve-guests"
                          >
                            {[1,2,3,4,5,6,7,8,9,10].map(n => (
                              <option key={n} value={n.toString()}>{n} {n === 1 ? 'Person' : 'People'}</option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="requests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary font-medium">Special Requests (Optional)</FormLabel>
                      <FormControl>
                        <textarea 
                          {...field} 
                          rows={3}
                          placeholder="Any allergies, high chair needed, etc."
                          className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background/50 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all resize-none"
                          data-testid="input-reserve-requests"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <button 
                  type="submit"
                  className="w-full bg-secondary text-secondary-foreground py-4 rounded-xl font-bold text-lg hover:bg-secondary/90 transition-all hover:shadow-lg active:scale-[0.98]"
                  data-testid="button-reserve-submit"
                >
                  Make Reservation
                </button>
              </form>
            </Form>
          </div>

          <motion.div 
            className="lg:w-1/2 min-h-[400px] lg:min-h-full relative"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <img 
              src={peopleImg} 
              alt="Happy people eating burgers together" 
              className="absolute inset-0 w-full h-full object-cover"
              data-testid="img-reserve-people"
            />
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
