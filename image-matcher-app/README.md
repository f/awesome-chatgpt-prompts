# Image Matcher – Android App

An Android (Kotlin + Jetpack Compose) application for pairing a **source** image
with its **edited** counterpart, auto-renaming the edited file, and moving or
copying both to separate destination folders – all without requiring legacy storage
permissions.

---

## Features

- **Mixed image pool** – aggregate images from one or more input folders into a
  single grid.
- **Drag-free slot assignment** – tap any image → assign it as *Source* or *Edited*.
- **Smart similarity check** – the app warns you when the two images appear
  nearly identical, so you don't accidentally pair an unedited duplicate.
- **Auto-renaming** – the edited image is saved as
  `edited_<serial>__src_<source_basename>.<ext>` (e.g. `edited_000042__src_portrait.jpg`).
- **Move or Copy** mode.
- **Name-collision handling** – Rename (append `__v2`, `__v3` …), Skip, or Overwrite.
- **Room DB log** – every pair operation is recorded with URIs before/after and
  the comparison result.
- **DataStore settings** – all preferences survive app restarts.

---

## Requirements

- Android **8.0 (API 26)** or higher.
- The app targets API 35 (Android 15).

---

## Installation

1. Clone or download this repository.
2. Open the `image-matcher-app/` folder in **Android Studio Hedgehog** (or later).
3. Let Gradle sync finish.
4. Build → Run on a physical device or emulator running API 26+.

> **Tip:** Use a physical device for real SAF folder picking; some emulator images
> do not ship with a working file manager for `ACTION_OPEN_DOCUMENT_TREE`.

---

## Storage Access Framework (SAF) – How It Works

Android 10+ (Scoped Storage) forbids direct file-path access to arbitrary
directories.  This app uses **Storage Access Framework** exclusively:

| Action | SAF API used |
|--------|--------------|
| Pick a folder | `ActivityResultContracts.OpenDocumentTree` |
| Keep access across reboots | `ContentResolver.takePersistableUriPermission` |
| List files | `DocumentFile.fromTreeUri().listFiles()` |
| Create / write file | `DocumentFile.createFile()` + `ContentResolver.openOutputStream()` |
| Read file | `ContentResolver.openInputStream()` |
| Delete file | `DocumentFile.delete()` |

**No `READ_EXTERNAL_STORAGE` or `WRITE_EXTERNAL_STORAGE` permissions are
declared** – they are not needed when using SAF tree URIs.

---

## How to Use

### 1. Settings screen

Tap the ⚙ icon on the Workbench.

| Setting | Description |
|---------|-------------|
| **Input Folders** | Tap *Add Input Folder* → pick a directory. Images inside are shown in the grid. Add as many folders as needed. |
| **Originals target** | Default destination for source images. |
| **Edited target** | Default destination for renamed edited images. |
| **Mode** | `MOVE` deletes originals after a successful transfer; `COPY` keeps them. |
| **Name Collision** | What to do when the destination already has a file with the same name. |
| **Serial Padding** | Number of zero-padded digits in the serial number (default 6 → `000001`). |

### 2. Workbench screen

1. The grid shows all images from every configured input folder.
2. Tap an image → choose **Set as SOURCE** or **Set as EDITED**.
3. The two chosen images appear in the slot panel at the top.
4. Optionally override the destination folders for this one operation.
5. Tap **Pair + Rename + Transfer**.

The edited file will be saved as:

```
edited_<serial>__src_<source_basename>.<edited_ext>
```

Example – source `portrait_final.jpg`, edited `DSC_0042.jpg`, serial 7:

```
edited_000007__src_portrait_final.jpg
```

---

## "Images appear identical" warning

The app runs a two-stage comparison before every operation:

1. **Byte-level** – if file size and SHA-256 hash are both equal → **IDENTICAL**.
2. **Perceptual dHash** – both images are scaled to ≈256 px and a 64-bit
   difference hash is computed. If the Hamming distance yields ≥ 95 % similarity
   → **VERY SIMILAR**.

When either condition is met, a warning dialog appears:
> *"The selected images look almost identical – the edited version may not have
> been changed."*

You can **Continue** (proceed anyway) or **Cancel** (go back and recheck).

---

## Database Schema

Table **`pair_records`**:

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK AUTOINCREMENT | Serial number |
| `createdAt` | INTEGER | Unix timestamp (ms) |
| `sourceUri` | TEXT | Original source content URI |
| `editedUriBefore` | TEXT | Edited file URI before transfer |
| `sourceUriAfter` | TEXT | Source URI after transfer |
| `editedUriAfter` | TEXT | Edited URI after rename + transfer |
| `editedNewFilename` | TEXT | Final filename of the edited file |
| `compareResult` | TEXT | `IDENTICAL` / `VERY_SIMILAR` / `DIFFERENT` |
| `compareScore` | REAL | Perceptual similarity score (0–1) |

---

## Project Structure

```
image-matcher-app/
├── app/src/main/
│   ├── AndroidManifest.xml
│   └── java/com/example/imagematcher/
│       ├── MainActivity.kt
│       ├── data/
│       │   ├── db/          – Room entities, DAO, AppDatabase
│       │   ├── datastore/   – AppSettings (DataStore)
│       │   ├── model/       – ImageFile data class
│       │   └── repository/  – PairRepository (business logic)
│       ├── ui/
│       │   ├── theme/       – Material 3 theme
│       │   ├── navigation/  – NavHost graph
│       │   └── screens/
│       │       ├── settings/  – SettingsScreen + SettingsViewModel
│       │       └── workbench/ – WorkbenchScreen + WorkbenchViewModel
│       └── util/
│           ├── FileUtils.kt    – Filename sanitization & building
│           ├── ImageCompare.kt – SHA-256 + dHash comparison
│           └── SafUtils.kt     – SAF copy/move/list helpers
```

---

## License

MIT
