import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/pages/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

export default function ManageOrganizersPage({ displayType }) {
  const { id } = useParams(); // Event ID
  const navigate = useNavigate();
  const {
    event,
    fetchOrganizers,
    addOrganizer,
    removeOrganizer,
    loading,
    error,
  } = useEvent();
  
  const [newOrganizerUTORid, setNewOrganizerUTORid] = useState("");
  const [message, setMessage] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [organizerToDelete, setOrganizerToDelete] = useState(null);

  useEffect(() => {
    if (id) fetchOrganizers(id).catch(err => setMessage(err.message));
  }, [id]);

  const handleAddOrganizer = async () => {
    if (!newOrganizerUTORid.trim()) {
      setMessage("Please enter a UTORid");
      return;
    }

    try {
      await addOrganizer(id, newOrganizerUTORid.trim());
      setMessage("Organizer added successfully!");
      setNewOrganizerUTORid("");
      await fetchOrganizers(id); // Refresh list
    } catch (err) {
      setMessage(err.message || "Failed to add organizer");
    }
  };

  const handleRemoveOrganizer = async (userId) => {
    setOrganizerToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const confirmRemoveOrganizer = async () => {
    if (!organizerToDelete) return;

    try {
      await removeOrganizer(id, organizerToDelete);
      setMessage("Organizer removed successfully!");
      await fetchOrganizers(id); // Refresh list
    } catch (err) {
      setMessage(err.message || "Failed to remove organizer");
    } finally {
      setDeleteDialogOpen(false);
      setOrganizerToDelete(null);
    }
  };

  const organizers = event?.organizers || [];

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
            <Label className="text-3xl font-bold">Manage Organizers</Label>
            <p className="text-gray-600 mt-1">
              Add or remove organizers for this event
            </p>
          </div>
        </div>        
        {/* Add Organizer Card */}
        <div className="flex flex-col gap-2 w-full">
        <Card className="w-full">
          <CardContent className="flex flex-col gap-2 p-4">
            {/* Status Banner */}
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
                placeholder="Enter UTORid"
                value={newOrganizerUTORid}
                onChange={(e) => setNewOrganizerUTORid(e.target.value)}
              />
              <Button onClick={handleAddOrganizer} disabled={loading}>
                Add Organizer
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* Organizers List */}
        <div className="flex flex-col gap-2 w-full">
          {loading ? (
            <p>Loading organizers...</p>
          ) : organizers.length === 0 ? (
            <p className="text-gray-500">No organizers yet.</p>
          ) : (
            organizers.map((o) => (
              <Card key={o.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex flex-col justify-center">
                    <span className="font-semibold">{o.name}</span>
                    <span className="text-gray-500 text-sm">{o.utorid}</span>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveOrganizer(o.id)}
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Organizer</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove this organizer? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setOrganizerToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmRemoveOrganizer}
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