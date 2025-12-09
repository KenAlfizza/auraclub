import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/pages/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronLeft } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEvent } from "@/context/EventContext";

export function ManageGuestsPage() {
  const { id } = useParams(); // Event ID
  const navigate = useNavigate();
  const {
    guests,
    fetchGuests,
    addGuest,
    removeGuest,
    loading,
    error,
  } = useEvent();

  const [message, setMessage] = useState("");
  const [newGuestUTORid, setNewGuestUTORid] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState(null);

  useEffect(() => {
  if (id) {
    fetchGuests(id).catch(err => setMessage(err.message));
  }
  }, [id]);

  const handleAddGuest = async () => {
    if (!newGuestUTORid.trim()) {
      setMessage("Please enter a UTORid");
      return;
    }

    try {
      await addGuest(id, newGuestUTORid.trim());
      setMessage("Guest added successfully!");
      setNewGuestUTORid("");
      await fetchGuests(id);
    } catch (err) {
      setMessage(err.message || "Failed to add guest");
    }
  };

  const handleRemoveGuest = (guestId) => {
    setGuestToDelete(guestId);
    setDeleteDialogOpen(true);
  };

  const confirmRemoveGuest = async () => {
    if (!guestToDelete) return;

    try {
      await removeGuest(id, guestToDelete);
      setMessage("Guest removed successfully!");
      await fetchGuests(id)
    } catch (err) {
      setMessage(err.message || "Failed to remove guest");
    } finally {
      setDeleteDialogOpen(false);
      setGuestToDelete(null);
    }
  };

  return (
    <Layout header sidebar>
      <div className="flex flex-col w-full h-full gap-6 mx-auto">
        {/* Header */}
        <div className="flex flex-row items-center gap-4">
          <ChevronLeft
            className="hover:cursor-pointer scale-125"
            onClick={() => navigate(-1)}
          />
          <div>
            <Label className="text-3xl font-bold">Manage Guests / RSVPs</Label>
            <p className="text-gray-600 mt-1">
              Add, remove, and update guests for this event
            </p>
          </div>
        </div>

        {/* Add Guest Card */}
        <Card className="w-full">
          <CardContent className="flex flex-col gap-2 p-4">
            {(message || error) && (
              <div
                className={`w-full p-3 rounded-md ${
                  message.includes("successfully")
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {message || error}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Enter guest UTORid"
                value={newGuestUTORid}
                onChange={(e) => setNewGuestUTORid(e.target.value)}
              />
              <Button onClick={handleAddGuest} disabled={loading}>
                Add Guest
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Guests List */}
        <div className="flex flex-col gap-2 w-full">
          {loading ? (
            <p>Loading guests...</p>
          ) : guests.length === 0 ? (
            <p className="text-gray-500">No guests yet.</p>
          ) : (
            guests.map((g) => (
              <Card key={g.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex flex-col justify-center">
                    <span className="font-semibold">{g.name}</span>
                    <span className="text-gray-500 text-sm">{g.utorid}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveGuest(g.id)}
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Guest</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove this guest? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setGuestToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmRemoveGuest}
                className="bg-red-600 hover:bg-red-700"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}

export default ManageGuestsPage;
