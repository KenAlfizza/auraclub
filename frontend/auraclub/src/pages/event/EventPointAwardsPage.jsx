import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/pages/Layout";
import { useEvent } from "@/context/EventContext";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft } from "lucide-react";

export default function EventPointAwardsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { event, fetchEvent, guests, fetchGuests, awardPoints, resolveUserId, loading } = useEvent();

  const [amount, setAmount] = useState("");
  const [utorid, setUtorid] = useState("");
  const [applyToAll, setApplyToAll] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (id) {
      fetchEvent(id);
      fetchGuests(id);
    }
  }, [id]);

  const handleAwardPoints = async () => {
    setError("");
    setSuccess("");

    if (!amount || Number(amount) <= 0) {
        setError("Enter a valid positive number for points.");
        return;
    }

    try {
        let payload = { amount: Number(amount) };

        if (!applyToAll) {
        // Resolve the UTORid to userId
        const userId = await resolveUserId(utorid.trim());
        payload.userId = userId;
        }

        const res = await awardPoints(id, payload);

        setSuccess(res.message);
        setAmount("");
        setUtorid("");
        fetchEvent(id);
        fetchGuests(id);
    } catch (err) {
        setError(err.message || "Failed to award points");
    }
  };


  if (loading || !event) return <p>Loading event...</p>;

  return (
    <Layout header sidebar>
      <div className="flex flex-col w-full h-full gap-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
        {/* Top row: back button + event name */}
        <div className="flex items-center gap-4">
            <div
            className="rounded-full hover:bg-gray-100 p-2 cursor-pointer flex items-center justify-center"
            onClick={() => navigate(-1)}
            >
            <ChevronLeft className="w-8 h-8 text-gray-700" />
            </div>
            <div>
            <Label className="text-3xl font-bold text-gray-900">
            {event?.name + " - Award Points"}
            </Label>

            {/* Subtitle / description */}
            <p className="text-gray-600 text-lg mt-1">
                Award points to single or multiple guest
            </p>
            </div>
        </div>

        {/* Remaining points */}
        {event?.pointsRemain != null && (
            <p className="text-base text-gray-600 mt-2">Points Remaining: {event.pointsRemain}</p>
        )}
        </div>
        {/* Form Card */}
        <Card className="w-full">
          <CardContent className="p-6 space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert variant="default">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Points Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-lg font-medium">Points Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter points to award"
                className="text-base"
              />
            </div>

            {/* Award to All Switch */}
            <div className="flex items-center gap-2 text-lg">
              <Switch checked={applyToAll} onCheckedChange={setApplyToAll} />
              <span>{applyToAll ? "Award to all guests" : "Award to single guest"}</span>
            </div>

            {/* UTORid input */}
            {!applyToAll && (
              <div className="space-y-2">
                <Label htmlFor="utorid" className="text-lg font-medium">Guest UTORid</Label>
                <Input
                  id="utorid"
                  value={utorid}
                  onChange={(e) => setUtorid(e.target.value)}
                  placeholder="Enter guest UTORid"
                  className="text-base"
                />
              </div>
            )}

            {/* Award Button */}
            <Button onClick={handleAwardPoints} className="mt-2 text-lg">
              Award Points
            </Button>
          </CardContent>
        </Card>

        {/* Confirmed Guests */}
        <div className="flex flex-col gap-3">
          <Label className="text-2xl font-semibold">Confirmed Guests</Label>
          {guests.map((g) => (
            <Card key={g.id} className="w-full">
              <CardContent className="flex justify-between items-center p-4">
                <div className="flex flex-col">
                  <span className="text-lg font-medium">{g.name}</span>
                  <span className="text-sm text-gray-500">{g.utorid}</span>
                </div>
                <span className={`text-sm font-semibold ${g.attended ? "text-green-600" : "text-red-600"}`}>
                  {g.attended ? "Attended" : "Not attended"}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
