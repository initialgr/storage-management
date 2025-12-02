"use client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { actionsDropdownItems } from "@/constants";
import { constructDownloadUrl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Models } from "node-appwrite";
import { useState } from "react";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { renameFile } from "@/lib/actions/file.actions";
import { Input } from "./ui/input";
import { FileDetails } from "./ActionModalContent";

const ActionDropDown = ({ file }: { file: Models.Document }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [action, setAction] = useState<ActionType | null>(null);
  const [name, setName] = useState(file.name);
  const [isLoading, setIsLoading] = useState(false);
  const path = usePathname();

  const closeAllModals = () => {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
    setAction(null);
    setName(file.name);
  };

  const handleAction = async () => {
    // 1. Ensure 'action' object and its 'value' property exist
    if (!action || !action.value) return;

    setIsLoading(true);

    const actionValue = action.value as keyof typeof actions;

    // Define the map of actions (These functions return Promises)
    const actions = {
      rename: async () => {
        // Use try/catch here to explicitly handle the outcome of the server action
        try {
          // Await the server function. It should return a document on success.
          const updatedFile = await renameFile({
            fileId: file.$id,
            name,
            extension: file.extension,
            path,
          });
          // Return true if an object (document) was successfully returned
          return !!updatedFile;
        } catch (e) {
          // Log the UI-side error and return false on failure
          console.error(`Action failed: ${actionValue}`, e);
          return false;
        }
      },
      share: () => {
        console.log("share");
        return true;
      }, // Return true for synchronous actions
      delete: () => {
        console.log("delete");
        return true;
      }, // Return true for synchronous actions
    };

    let success = false;

    // 2. Execute the action by correctly indexing the 'actions' map
    if (actions[actionValue]) {
      success = await actions[actionValue]();
    } else {
      console.error(`Invalid action value: ${actionValue}`);
    }

    // 3. Check for clear boolean success before closing modal
    if (success) {
      closeAllModals();
    }

    setIsLoading(false);
  };
  const renderDialogContent = () => {
    if (!action) return null;
    const { value, label } = action;
    return (
      <DialogContent className="shad-dialog button">
        <DialogHeader className="flex flex-col gap-3">
          <DialogTitle className="text-center text-light-100">
            {label}
          </DialogTitle>
          {value === "rename" && (
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-2"
            />
          )}
          {value && 'details' && <FileDetails file={file}></FileDetails>}
        </DialogHeader>
        {["rename", "delete", "share"].includes(value) && (
          <DialogFooter className="flex flex-col gap-3 md:flex-row ">
            <Button onClick={closeAllModals} className="modal-cancel-button">
              Cancel
            </Button>
            <Button onClick={handleAction} className="modal-submit-button">
              <p className="capitalize">{value}</p>
              {isLoading && (
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loader"
                  width={24}
                  height={24}
                  className="animate-spin"
                />
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    );
  };
  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger className="shad-no-focus">
          <img src="/assets/icons/dots.svg" alt="dot" width={34} height={34} />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel className="max-w-[200px] truncate">
            {file.name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actionsDropdownItems.map((actionItem) => (
            <DropdownMenuItem
              key={actionItem.value}
              className="shad-dropdown-item"
              onClick={() => {
                setAction(actionItem);

                if (
                  ["rename", "share", "delete", "details"].includes(
                    actionItem.value
                  )
                ) {
                  setIsModalOpen(true);
                }
              }}
            >
              {actionItem.value === "download" ? (
                <Link
                  href={constructDownloadUrl(file.bucketFileId)}
                  download={file.name}
                  className="flex items-center gap-2"
                >
                  <Image
                    src={actionItem.icon}
                    alt={actionItem.label}
                    width={30}
                    height={30}
                  />
                  {actionItem.label}
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Image
                    src={actionItem.icon}
                    alt={actionItem.label}
                    width={30}
                    height={30}
                  />
                  {actionItem.label}
                </div>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {renderDialogContent()}
    </Dialog>
  );
};

export default ActionDropDown;
