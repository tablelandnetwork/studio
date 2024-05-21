"use client";

import { type schema } from "@tableland/studio-store";
import { Copy } from "lucide-react";
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
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";

const socialIconSize = 48;

export default function Share({
  project,
  className,
}: React.HTMLAttributes<HTMLElement> & { project: schema.Project }) {
  const { toast } = useToast();
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(function () {
        toast({
          title: "Done!",
          description: `The ${project.name} Project link has been copied to your clipboard.`,
          duration: 2000,
        });
      })
      .catch(function (err) {
        toast({
          title: "Error!",
          description: [
            `The ${project.name} Project link could not be copied to your clipboard.`,
            typeof err?.message === "string" ? err.message : undefined,
          ]
            .filter((s) => s)
            .join(" "),
          duration: 2000,
        });
      });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center space-x-4">
        <TwitterShareButton
          url={url}
          className="transform transition duration-100 hover:scale-110"
        >
          <TwitterIcon size={socialIconSize} round />
        </TwitterShareButton>
        <FacebookShareButton
          url={url}
          className="transform transition duration-100 hover:scale-110"
        >
          <FacebookIcon size={socialIconSize} round />
        </FacebookShareButton>
        <RedditShareButton
          url={url}
          className="transform transition duration-100 hover:scale-110"
        >
          <RedditIcon size={socialIconSize} round />
        </RedditShareButton>
        <TelegramShareButton
          url={url}
          className="transform transition duration-100 hover:scale-110"
        >
          <TelegramIcon size={socialIconSize} round />
        </TelegramShareButton>
        <WeiboShareButton
          url={url}
          className="transform transition duration-100 hover:scale-110"
        >
          <WeiboIcon size={socialIconSize} round />
        </WeiboShareButton>
        <EmailShareButton
          url={url}
          className="transform transition duration-100 hover:scale-110"
        >
          <EmailIcon size={socialIconSize} round />
        </EmailShareButton>
      </div>
      <div className="flex items-center justify-center">
        <p className="text-sm text-muted-foreground">{url}</p>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleCopyLink}>
                <Copy className="size-5 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to copy link</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
