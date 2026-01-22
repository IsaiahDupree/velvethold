import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Heart } from "lucide-react";

export interface ProfileCardProps {
  profile: {
    id: string;
    displayName: string;
    age: number;
    city: string;
    bio?: string | null;
    intent?: string | null;
    depositAmount?: number | null;
  };
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
      <CardHeader className="pb-4">
        {/* Profile Avatar Placeholder */}
        <div className="w-full aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg mb-4 flex items-center justify-center">
          <div className="text-6xl font-bold text-primary/40">
            {profile.displayName.charAt(0).toUpperCase()}
          </div>
        </div>

        <CardTitle className="text-xl">
          {profile.displayName}, {profile.age}
        </CardTitle>

        <CardDescription className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4" />
            {profile.city}
          </div>
          {profile.intent && (
            <div className="flex items-center gap-2 text-sm">
              <Heart className="h-4 w-4" />
              {profile.intent.charAt(0).toUpperCase() + profile.intent.slice(1)}
            </div>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {profile.bio && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {profile.bio}
          </p>
        )}

        {profile.depositAmount && (
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-muted-foreground">
              Deposit Amount
            </span>
            <span className="font-semibold">
              ${(profile.depositAmount / 100).toFixed(2)}
            </span>
          </div>
        )}

        <Button className="w-full" asChild>
          <Link href={`/profiles/${profile.id}`}>
            View Profile
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
