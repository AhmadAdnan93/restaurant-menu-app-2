"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useLocale } from "@/components/LocaleProvider";

interface RatingProps {
  menuItemId: string;
  currentRating?: number;
  ratingCount?: number;
}

export function Rating({ menuItemId, currentRating = 0, ratingCount = 0 }: RatingProps) {
  const { t } = useLocale();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/supabase/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          menuItemId,
          value: rating,
          comment: comment.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit rating");
      }

      toast({
        title: t.thankYou,
        description: t.ratingSubmitted,
      });

      setOpen(false);
      setRating(0);
      setComment("");
      window.location.reload();
    } catch (error) {
      toast({
        title: t.error,
        description: t.ratingFailed,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= currentRating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        {currentRating > 0 && (
          <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
            ({currentRating.toFixed(1)})
          </span>
        )}
        {ratingCount > 0 && (
          <span className="text-sm text-gray-500 dark:text-gray-400">({ratingCount} {t.reviews})</span>
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-xs">
            {t.rate}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.rateThisDish}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hover || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <Textarea
              placeholder={t.addCommentOptional}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button onClick={handleSubmit} disabled={rating === 0} className="w-full">
              {t.submitRating}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

