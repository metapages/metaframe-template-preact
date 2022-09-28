import create from "zustand";
import localForage from "localforage";
import { FileBlob } from "/@/components/FileBlob";

interface FilesState {
  files: FileBlob[];
  addFile: (file: FileBlob) => void;
  setFiles: (files: FileBlob[]) => void;
  getFileBlob: (filename: string) => Promise<FileBlob>;
  copyFileToClipboard: (file: FileBlob) => Promise<void>;
  cacheFile: (file: FileBlob) => void;
  syncCachedFiles: () => void;

  deleteFile: (filename: string) => Promise<void>;
  deleteAllFiles: () => Promise<void>;

  error: string | null;
  setError: (error: string | null) => void;
}

export const useFileStore = create<FilesState>((set, get) => {
  return {
    files: [],
    setFiles: (files: FileBlob[]) => set((state) => ({ files })),

    getFileBlob: async (filename: string) => {
      const fileBlob = get().files.find((file) => file.name === filename);
      if (!fileBlob) {
        throw new Error("File not found");
      }
      if (fileBlob.value !== undefined) {
        return fileBlob;
      }

      if (!fileBlob.cached) {
        throw `File ${filename} is not cached`;
      }

      const valueFromCache: any | undefined | null = await localForage.getItem(
        fileBlob.name
      );
      if (valueFromCache !== undefined) {
        fileBlob.cached = true;
        fileBlob.value = valueFromCache;
        // trigger updates
        set((state) => ({
          files: [...get().files],
        }));

        return fileBlob;
      }

      throw `File not found: ${filename}`;
    },

    copyFileToClipboard: async (file: FileBlob) => {
      const blob = await get().getFileBlob(file.name);
      navigator.clipboard.writeText(blob.value);
    },

    cacheFile: async (file: FileBlob) => {
      if (file.cached) {
        return;
      }

      if (!file.value) {
        throw `cacheFile failed, not file File not found for: ${file.name}`;
      }

      try {
        await localForage.setItem(file.name, file.value);
        file.cached = true;
        // trigger updates
        set((state) => ({
          files: [...get().files],
        }));
      } catch (err) {
        console.log(err);
      }
    },

    syncCachedFiles: async () => {
      const keys = await localForage.keys();

      const files = get().files;
      const newFiles: FileBlob[] = [];
      keys.forEach((key) => {
        if (!files.find((f) => f.name === key)) {
          newFiles.push({
            name: key,
            cached: true,
          });
        }
      });

      set((state) => ({
        files: [...files, ...newFiles],
      }));
    },

    addFile: async (file: FileBlob) => {
      set((state) => ({
        // overwrite if already exists
        files: [...state.files.filter((f) => f.name !== file.name), file],
      }));
    },

    deleteFile: async (filename: string) => {
      const files = [...get().files];
      const fileBlob = get().files.find((file) => file.name === filename);

      if (fileBlob) {
        files.splice(files.indexOf(fileBlob), 1);
        try {
          await localForage.removeItem(filename);
        } catch (err) {
          console.log(err);
        }
      }

      set((state) => ({
        files,
      }));
    },

    deleteAllFiles: async () => {
      get().files.forEach(async (file) => {
        try {
          await localForage.removeItem(file.name);
        } catch (err) {
          console.log(err);
        }
      });

      set((state) => ({
        files: [],
      }));

      return Promise.resolve();
    },

    error: null,
    setError: (error: string | null) => set((state) => ({ error })),
  };
});
