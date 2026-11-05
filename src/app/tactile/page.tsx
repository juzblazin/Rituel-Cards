"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Heavyweights } from "@/components/leaderboard/heavyweights";
import { ChevronDown, Download, Pencil, Star, Trash2 } from "lucide-react";

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Showcase() {
  const [showBookmarks, setShowBookmarks] = useState(true);

  return (
    <div className="flex flex-col gap-10">
      <Section id="buttons" title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary action</Button>
          <Button variant="brand">Get card</Button>
          <Button variant="outline">Secondary</Button>
          <Button variant="secondary">Muted</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Delete</Button>
          <Button variant="link">Link</Button>
          <Button size="sm" variant="outline">
            <Download /> Export
          </Button>
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      <Section id="fields" title="Fields">
        <div className="grid max-w-sm gap-3">
          <Input placeholder="Search cards…" />
          <Input defaultValue="ledger" aria-invalid />
        </div>
      </Section>

      <Section id="cards" title="Cards">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>RedotPay Standard</CardTitle>
              <CardDescription>Visa · self-custody · no KYC tier</CardDescription>
              <CardAction>
                <Badge variant="success">2% back</Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Spend stablecoins anywhere Visa is accepted. Virtual card issued instantly.
              </p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button size="sm">Apply</Button>
              <Button size="sm" variant="outline">
                Details
              </Button>
            </CardFooter>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardTitle>Compact card</CardTitle>
              <CardDescription>Small density variant</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="brand">Featured</Badge>
                <Badge variant="outline">Visa</Badge>
                <Badge variant="warning">Fee</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section id="tables" title="Tables">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Card</TableHead>
              <TableHead>Cashback</TableHead>
              <TableHead>FX fee</TableHead>
              <TableHead className="text-right">Annual</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              ["RedotPay", "2.0%", "1.2%", "$0"],
              ["ether.fi Cash", "3.0%", "0.0%", "$0"],
              ["KAST", "8.0%", "1.0%", "$0"],
              ["Bybit Card", "10.0%", "0.9%", "$0"],
            ].map(([name, cb, fx, annual], i) => (
              <TableRow key={name}>
                <TableCell className="font-medium">{name}</TableCell>
                <TableCell className="text-success">{cb}</TableCell>
                <TableCell className="num">{fx}</TableCell>
                <TableCell className="num text-right">{annual}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={i === 0 ? "success" : "secondary"}>
                    {i === 0 ? "Live" : "Ranked"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>

      <Section id="menus" title="Dropdowns">
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline">
                  Sort by <ChevronDown />
                </Button>
              }
            />
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuLabel>Sort cards</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Star /> Cashback
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Pencil /> Annual fee
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={showBookmarks}
                onCheckedChange={setShowBookmarks}
              >
                Show saved
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <Trash2 /> Clear filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Section>

      <Section id="sheets" title="Sheets">
        <div>
          <Sheet>
            <SheetTrigger
              render={<Button variant="outline">Open filters</Button>}
            />
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Narrow the directory by network, custody and KYC.
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-3 px-4">
                <Input placeholder="Issuer name" />
                <Button>Apply filters</Button>
                <Button variant="outline">Reset</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Section>
    </div>
  );
}

export default function TactilePage() {
  return (
    <main className="container-page py-10">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">
        Tactile audit
      </h1>
      <div className="grid gap-12 xl:grid-cols-2">
        <div className="rounded-2xl bg-background p-6">
          <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Light
          </p>
          <Showcase />
        </div>
        <div className="dark rounded-2xl bg-background p-6">
          <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Dark
          </p>
          <Showcase />
        </div>
      </div>
      <div className="mt-12">
        <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Chart + KPI cards + data table (leaderboard section)
        </h2>
        <Heavyweights />
      </div>
    </main>
  );
}
