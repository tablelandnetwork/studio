import { Construction, Info, LogIn, Sparkles, Wallet } from "lucide-react";

export default function Page() {
  return (
    <main className="container flex flex-1 flex-col px-4 py-12">
      <div className="m-auto flex max-w-xl flex-1 flex-col justify-center space-y-4">
        <div className="flex items-center space-x-4">
          <Sparkles className="flex-shrink-0" />
          <h1 className="text-2xl font-medium">
            Thank you for visiting Tableland Studio.
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <Info className="flex-shrink-0" />
          <p className="text-muted-foreground">
            Tableland Studio makes it easy to design and deploy tables on
            Tableland, collaborate with teammates on projects, integate your
            project with the Studio CLI, and discover what other users are
            building on Tableland.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Construction className="flex-shrink-0" />
          <p className="text-muted-foreground">
            Parts of Studio are pretty bare bones right now, especially this
            landing page. There&apos;s definitely enough to get started, and
            we&apos;d love for you to dig in and let us know what you think.
            We&apos;re always continuing to build new Studio features, so be
            sure to come back for more!
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Wallet className="flex-shrink-0" />
          <p className="text-muted-foreground">
            Start by connecting your wallet using the button in the upper right
            corner of the screen.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <LogIn className="flex-shrink-0" />
          <p className="text-muted-foreground">
            Then log into Studio using the button in the upper right corner of
            the screen. You&apos;ll be prompted to choose a Studio username and
            then you&apos;ll be redirected to the Studio page for your personal
            Team..
          </p>
        </div>
      </div>
    </main>
  );
}
