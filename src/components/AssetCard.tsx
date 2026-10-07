import { useEffect, useState } from "react";
import { FileText, Image as ImageIcon, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { formatFileSize, getObjectUrl } from "@/lib/fileUtils";
import { Asset } from "@/lib/db";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/DropdownMenu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

interface AssetCardProps {
  asset: Asset;
  onDelete: (id: number) => void;
  onRename: (id: number, newName: string) => void;
}

export function AssetCard({ asset, onDelete, onRename }: AssetCardProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [newName, setNewName] = useState(asset.name);

  useEffect(() => {
    // Generate object URL for the blob
    if (asset.data) {
      const url = getObjectUrl(asset.data as Blob);
      setObjectUrl(url);
    }
  }, [asset.data]);

  const isImage = asset.type.startsWith("image/");

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newName === asset.name) {
      setIsRenameOpen(false);
      return;
    }
    onRename(asset.id!, newName);
    setIsRenameOpen(false);
  };

  const handleDeleteSubmit = () => {
    onDelete(asset.id!);
    setIsDeleteOpen(false);
  };

  return (
    <>
      <div className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col">
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 hover:bg-white dark:bg-zinc-900/90 dark:hover:bg-zinc-900 shadow-sm backdrop-blur-sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsRenameOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" /> Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsDeleteOpen(true)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center relative overflow-hidden">
          {isImage && objectUrl ? (
            <img 
              src={objectUrl} 
              alt={asset.name} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-zinc-400">
              {asset.type === "application/pdf" ? (
                <FileText className="w-12 h-12 mb-2 opacity-50" />
              ) : (
                <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
              )}
              <span className="text-xs font-medium uppercase tracking-wider">{asset.type.split("/")[1] || "File"}</span>
            </div>
          )}
          
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 pointer-events-none">
            <span className="text-white text-xs font-medium bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-auto cursor-pointer">View Asset</span>
          </div>
        </div>
        
        <div className="p-3">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate" title={asset.name}>
            {asset.name}
          </p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-zinc-500">
              {formatFileSize(asset.size)}
            </p>
            <p className="text-xs text-zinc-400 capitalize">
              {asset.type.split("/")[1] || "file"}
            </p>
          </div>
        </div>
      </div>

      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleRenameSubmit}>
            <DialogHeader>
              <DialogTitle>Rename Asset</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Filename</Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter new filename..."
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsRenameOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Asset</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-zinc-500 dark:text-zinc-400">
              Are you sure you want to delete <span className="font-semibold text-zinc-900 dark:text-zinc-100">{asset.name}</span>? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={handleDeleteSubmit}>Delete Asset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

