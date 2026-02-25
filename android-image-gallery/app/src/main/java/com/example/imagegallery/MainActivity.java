package com.example.imagegallery;

import android.Manifest;
import android.content.ClipData;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.view.View;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.GridLayoutManager;

import com.example.imagegallery.databinding.ActivityMainBinding;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity implements ImageAdapter.OnImageActionListener {

    private ActivityMainBinding binding;
    private ImageAdapter imageAdapter;
    private final List<Uri> selectedImages = new ArrayList<>();

    // Launcher for picking multiple images
    private final ActivityResultLauncher<Intent> imagePickerLauncher =
        registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
            if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                Intent data = result.getData();
                List<Uri> newImages = new ArrayList<>();

                // Handle multiple image selection
                if (data.getClipData() != null) {
                    ClipData clipData = data.getClipData();
                    for (int i = 0; i < clipData.getItemCount(); i++) {
                        newImages.add(clipData.getItemAt(i).getUri());
                    }
                } else if (data.getData() != null) {
                    // Single image selected
                    newImages.add(data.getData());
                }

                // Grant persistent URI permissions
                for (Uri uri : newImages) {
                    try {
                        getContentResolver().takePersistableUriPermission(
                            uri, Intent.FLAG_GRANT_READ_URI_PERMISSION
                        );
                    } catch (SecurityException e) {
                        // Not all URIs support persistable permissions - that's ok
                    }
                }

                // Add new images (avoid duplicates)
                for (Uri uri : newImages) {
                    if (!selectedImages.contains(uri)) {
                        selectedImages.add(uri);
                    }
                }

                imageAdapter.setImages(new ArrayList<>(selectedImages));
                updateUI();
            }
        });

    // Launcher for requesting permissions
    private final ActivityResultLauncher<String[]> permissionLauncher =
        registerForActivityResult(new ActivityResultContracts.RequestMultiplePermissions(), permissions -> {
            boolean granted = false;
            for (Boolean value : permissions.values()) {
                if (value) { granted = true; break; }
            }
            if (granted) {
                openImagePicker();
            } else {
                showPermissionDeniedDialog();
            }
        });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityMainBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        setSupportActionBar(binding.toolbar);
        setupRecyclerView();
        setupClickListeners();
        updateUI();
    }

    private void setupRecyclerView() {
        imageAdapter = new ImageAdapter(this, this);
        // 2 columns grid
        binding.recyclerViewImages.setLayoutManager(new GridLayoutManager(this, 2));
        binding.recyclerViewImages.setAdapter(imageAdapter);
    }

    private void setupClickListeners() {
        binding.fabPickImages.setOnClickListener(v -> checkPermissionsAndPick());
        binding.btnClear.setOnClickListener(v -> clearAllImages());
    }

    private void checkPermissionsAndPick() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            // Android 13+ uses READ_MEDIA_IMAGES
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_MEDIA_IMAGES)
                    == PackageManager.PERMISSION_GRANTED) {
                openImagePicker();
            } else {
                permissionLauncher.launch(new String[]{Manifest.permission.READ_MEDIA_IMAGES});
            }
        } else {
            // Android 12 and below uses READ_EXTERNAL_STORAGE
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_EXTERNAL_STORAGE)
                    == PackageManager.PERMISSION_GRANTED) {
                openImagePicker();
            } else {
                permissionLauncher.launch(new String[]{Manifest.permission.READ_EXTERNAL_STORAGE});
            }
        }
    }

    private void openImagePicker() {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.setType("image/*");
        intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION
            | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
        imagePickerLauncher.launch(Intent.createChooser(intent, "בחר תמונות"));
    }

    private void clearAllImages() {
        selectedImages.clear();
        imageAdapter.setImages(new ArrayList<>());
        updateUI();
    }

    private void updateUI() {
        int count = selectedImages.size();
        if (count == 0) {
            binding.emptyState.setVisibility(View.VISIBLE);
            binding.recyclerViewImages.setVisibility(View.GONE);
            binding.headerBar.setVisibility(View.GONE);
        } else {
            binding.emptyState.setVisibility(View.GONE);
            binding.recyclerViewImages.setVisibility(View.VISIBLE);
            binding.headerBar.setVisibility(View.VISIBLE);

            String countText = (count == 1)
                ? getString(R.string.one_image_selected)
                : getString(R.string.images_selected, count);
            binding.tvImageCount.setText(countText);
        }
    }

    private void showPermissionDeniedDialog() {
        new AlertDialog.Builder(this)
            .setTitle(R.string.permission_required)
            .setMessage(R.string.permission_denied)
            .setPositiveButton(R.string.open_settings, (dialog, which) -> {
                Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                    Uri.fromParts("package", getPackageName(), null));
                startActivity(intent);
            })
            .setNegativeButton(R.string.cancel, null)
            .show();
    }

    // --- ImageAdapter.OnImageActionListener callbacks ---

    @Override
    public void onImageClick(Uri imageUri, int position) {
        // Open full-screen detail view
        Intent intent = new Intent(this, ImageDetailActivity.class);
        intent.setData(imageUri);
        startActivity(intent);
    }

    @Override
    public void onImageRemove(Uri imageUri, int position) {
        selectedImages.remove(imageUri);
        imageAdapter.setImages(new ArrayList<>(selectedImages));
        updateUI();
        Toast.makeText(this, "תמונה הוסרה", Toast.LENGTH_SHORT).show();
    }
}
