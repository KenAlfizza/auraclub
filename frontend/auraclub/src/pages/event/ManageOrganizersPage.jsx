import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/pages/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, ChevronLeft, UserCog, Shield, AlertCircle, Check } from "lucide-react";
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

export function ManageOrganizersPage({ displayType }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { organizers, fetchOrganizers, addOrganizer, removeOrganizer, resolveUserId, loading, error } = useEvent();
  
  const [newOrganizerUTORid, setNewOrganizerUTORid] = useState("");
  const [message, setMessage] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [organizerToDelete, setOrganizerToDelete] = useState(null);

  useEffect(() => {
    if (id) fetchOrganizers(id).catch(err => setMessage(err.message));
  }, [id]);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleAddOrganizer = async () => {
    if (!newOrganizerUTORid.trim()) {
      showMessage("Please enter a UTORid");
      return;
    }

    try {
      const userId = await resolveUserId(newOrganizerUTORid.trim());
      await addOrganizer(id, userId);
      showMessage("Organizer added successfully!");
      setNewOrganizerUTORid("");
      await fetchOrganizers(id);
    } catch (err) {
      showMessage(err.message || "Failed to add organizer");
    }
  };

  const handleRemoveOrganizer = async (utorid) => {
    try {
      const userId = await resolveUserId(utorid);
      setOrganizerToDelete(userId);
      setDeleteDialogOpen(true);
    } catch (err) {
      showMessage(err.message || "Failed to resolve UTORid");
    }
  };

  const confirmRemoveOrganizer = async () => {
    if (!organizerToDelete) return;

    try {
      await removeOrganizer(id, organizerToDelete);
      showMessage("Organizer removed successfully!");
      await fetchOrganizers(id);
    } catch (err) {
      showMessage(err.message || "Failed to remove organizer");
    } finally {
      setDeleteDialogOpen(false);
      setOrganizerToDelete(null);
    }
  };

  return (
    <Layout header sidebar>
      <div className="flex flex-col w-full h-full gap-6 mx-auto">
        {/* Header */}
        <div className="flex flex-row items-center gap-4">
          <div 
            className="rounded-full hover:bg-gray-100 p-2 cursor-pointer flex items-center justify-center"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Organizers</h1>
            <p className="text-gray-500 mt-1">
              Add or remove organizers for this event
            </p>
          </div>
        </div>

        {/* Message */}
        {(message || error) && (
          <div
            className={`w-full p-4 rounded-lg border ${
              message.includes("successfully") 
                ? "bg-green-50 text-green-800 border-green-200" 
                : "bg-red-50 text-red-800 border-red-200"
            } flex items-center gap-2 shadow-sm`}
          >
            {message.includes("successfully") ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{message || error}</span>
          </div>
        )}

        {/* Add Organizer Card */}
        <Card className="shadow-md hover:shadow-lg transition-shadow border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <UserCog className="w-5 h-5 text-indigo-600" />
              </div>
              <Label className="text-lg font-semibold text-gray-900">Add Organizer</Label>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Enter UTORid"
                value={newOrganizerUTORid}
                onChange={(e) => setNewOrganizerUTORid(e.target.value)}
                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
              <Button 
                onClick={handleAddOrganizer} 
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6"
              >
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Organizers List */}
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Shield className="w-5 h-5 text-indigo-600" />
            </div>
            <Label className="text-xl font-semibold text-gray-900">Organizers</Label>
            <span className="ml-2 bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
              {organizers.length}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : organizers.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <UserCog className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-gray-500 font-medium">No organizers yet</p>
                <p className="text-gray-400 text-sm">Add your first organizer above</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {organizers.map((o) => (
                <Card key={o.id} className="shadow-sm hover:shadow-md transition-all border-gray-200">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 p-2 rounded-full">
                        <Shield className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{o.name}</span>
                        <span className="text-gray-500 text-sm">{o.utorid}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveOrganizer(o.id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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

export default ManageOrganizersPage;