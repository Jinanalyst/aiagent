import { Navigation } from "@/components/ui/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const faqs = [
    {
        question: "What is Lovable?",
        answer: "Lovable is an AI-powered platform that allows you to generate code for applications and websites by simply describing what you want to build."
    },
    {
        question: "How do credits work?",
        answer: "Each generation consumes a certain number of credits. You get a free allocation of credits each month, and you can upgrade to a paid plan for more."
    },
    {
        question: "Can I use this for commercial projects?",
        answer: "Yes, all code generated on any plan, including the free plan, can be used for personal and commercial projects."
    },
    {
        question: "What if I'm not satisfied with the generated code?",
        answer: "Our AI is constantly learning, but if you're not happy with a result, you can try rephrasing your prompt or adding more detail. Pro and Premium users also have access to priority support for assistance."
    }
]

export default function SupportPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-24">
        <section className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
            Support Center
          </h1>
          <p className="max-w-2xl mx-auto mb-8 text-muted-foreground md:text-lg">
            Have questions? We're here to help.
          </p>
        </section>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 mt-12">
            <div>
                <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, i) => (
                        <AccordionItem value={`item-${i+1}`} key={i}>
                            <AccordionTrigger>{faq.question}</AccordionTrigger>
                            <AccordionContent>{faq.answer}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
            <div>
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Us</CardTitle>
                        <CardDescription>
                            Can't find the answer? Send us a message.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Your Email</Label>
                            <Input id="email" type="email" placeholder="you@example.com" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" placeholder="How can we help?" />
                        </div>
                        <Button className="w-full">Send Message</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
    </div>
  );
} 