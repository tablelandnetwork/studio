"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { schema } from "@tableland/studio-store";
import { Copy, Share2 } from "lucide-react";
import { useState } from "react";
import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  RedditIcon,
  RedditShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterIcon,
  TwitterShareButton,
  WeiboIcon,
  WeiboShareButton,
} from "react-share";

const socialIconSize = 48;

export default function Share({
  project,
  className,
}: React.HTMLAttributes<HTMLElement> & { project: schema.Project }) {
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Done!",
      description: `The ${project.name} Project link has been copied to your clipboard.`,
      duration: 2000,
    });
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger className={cn(className)}>
        <Button variant="ghost" size="sm">
          <Share2 className="mr-1" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Project</DialogTitle>
          <DialogDescription>
            Please share the {project.name} project to let everyone know what
            you&apos;re working on and help us spread the word about Tableland
            Studio. Thank you!
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center space-x-4">
          <TwitterShareButton
            url={window.location.href}
            className="transform transition duration-100 hover:scale-110"
          >
            <TwitterIcon size={socialIconSize} round />
          </TwitterShareButton>
          <FacebookShareButton
            url={window.location.href}
            className="transform transition duration-100 hover:scale-110"
          >
            <FacebookIcon size={socialIconSize} round />
          </FacebookShareButton>
          <RedditShareButton
            url={window.location.href}
            className="transform transition duration-100 hover:scale-110"
          >
            <RedditIcon size={socialIconSize} round />
          </RedditShareButton>
          <TelegramShareButton
            url={window.location.href}
            className="transform transition duration-100 hover:scale-110"
          >
            <TelegramIcon size={socialIconSize} round />
          </TelegramShareButton>
          <WeiboShareButton
            url={window.location.href}
            className="transform transition duration-100 hover:scale-110"
          >
            <WeiboIcon size={socialIconSize} round />
          </WeiboShareButton>
          <EmailShareButton
            url={window.location.href}
            className="transform transition duration-100 hover:scale-110"
          >
            <EmailIcon size={socialIconSize} round />
          </EmailShareButton>
        </div>
        <div className="flex items-center justify-center">
          <p className="text-base text-muted-foreground">
            {window.location.href}
          </p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 px-2"
                  onClick={handleCopyLink}
                >
                  <Copy className="text-gray-300" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to copy link</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
