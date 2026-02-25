package com.example.imagegallery;

import android.content.ContentResolver;
import android.database.Cursor;
import android.graphics.Matrix;
import android.net.Uri;
import android.os.Bundle;
import android.provider.OpenableColumns;
import android.view.MotionEvent;
import android.view.ScaleGestureDetector;

import androidx.appcompat.app.AppCompatActivity;

import com.bumptech.glide.Glide;
import com.example.imagegallery.databinding.ActivityImageDetailBinding;

/**
 * Full-screen image viewer with pinch-to-zoom and pan support.
 */
public class ImageDetailActivity extends AppCompatActivity {

    private ActivityImageDetailBinding binding;
    private ScaleGestureDetector scaleDetector;

    // Touch/zoom state
    private float scaleFactor = 1.0f;
    private float lastTouchX, lastTouchY;
    private float translateX = 0f, translateY = 0f;
    private static final float MIN_SCALE = 0.5f;
    private static final float MAX_SCALE = 5.0f;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityImageDetailBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        setSupportActionBar(binding.toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("");
        }

        binding.toolbar.setNavigationOnClickListener(v -> onBackPressed());

        Uri imageUri = getIntent().getData();
        if (imageUri != null) {
            loadImage(imageUri);
            displayFileInfo(imageUri);
        }

        setupZoomAndPan();
    }

    private void loadImage(Uri uri) {
        Glide.with(this)
            .load(uri)
            .placeholder(R.drawable.ic_image_placeholder)
            .error(R.drawable.ic_image_placeholder)
            .into(binding.ivFullImage);
    }

    private void displayFileInfo(Uri uri) {
        String fileName = getFileName(uri);
        String fileSize = getFileSize(uri);

        binding.tvDetailName.setText(fileName);
        binding.tvDetailInfo.setText(fileSize.isEmpty() ? "" : fileSize);
    }

    private String getFileName(Uri uri) {
        String result = null;
        if (uri.getScheme() != null && uri.getScheme().equals("content")) {
            try (Cursor cursor = getContentResolver().query(uri, null, null, null, null)) {
                if (cursor != null && cursor.moveToFirst()) {
                    int nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                    if (nameIndex >= 0) result = cursor.getString(nameIndex);
                }
            } catch (Exception e) {
                // fallback below
            }
        }
        if (result == null) {
            result = uri.getLastPathSegment();
        }
        return result != null ? result : "תמונה";
    }

    private String getFileSize(Uri uri) {
        try (Cursor cursor = getContentResolver().query(uri, null, null, null, null)) {
            if (cursor != null && cursor.moveToFirst()) {
                int sizeIndex = cursor.getColumnIndex(OpenableColumns.SIZE);
                if (sizeIndex >= 0 && !cursor.isNull(sizeIndex)) {
                    long bytes = cursor.getLong(sizeIndex);
                    return formatFileSize(bytes);
                }
            }
        } catch (Exception e) {
            // ignore
        }
        return "";
    }

    private String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
    }

    // --- Pinch-to-Zoom and Pan ---

    private void setupZoomAndPan() {
        scaleDetector = new ScaleGestureDetector(this, new ScaleGestureDetector.SimpleOnScaleGestureListener() {
            @Override
            public boolean onScale(ScaleGestureDetector detector) {
                scaleFactor *= detector.getScaleFactor();
                scaleFactor = Math.max(MIN_SCALE, Math.min(scaleFactor, MAX_SCALE));
                applyTransform();
                return true;
            }
        });

        binding.ivFullImage.setOnTouchListener((v, event) -> {
            scaleDetector.onTouchEvent(event);

            if (!scaleDetector.isInProgress()) {
                switch (event.getActionMasked()) {
                    case MotionEvent.ACTION_DOWN:
                        lastTouchX = event.getX();
                        lastTouchY = event.getY();
                        break;

                    case MotionEvent.ACTION_MOVE:
                        if (scaleFactor > 1.0f) {
                            // Only allow pan when zoomed in
                            translateX += event.getX() - lastTouchX;
                            translateY += event.getY() - lastTouchY;
                            applyTransform();
                        }
                        lastTouchX = event.getX();
                        lastTouchY = event.getY();
                        break;

                    case MotionEvent.ACTION_UP:
                        // Double-tap to reset zoom
                        if (event.getPointerCount() == 1 && scaleFactor != 1.0f) {
                            // Could add double-tap detection here
                        }
                        break;
                }
            }
            v.performClick();
            return true;
        });
    }

    private void applyTransform() {
        Matrix matrix = new Matrix();
        matrix.postScale(scaleFactor, scaleFactor,
            binding.ivFullImage.getWidth() / 2f,
            binding.ivFullImage.getHeight() / 2f);
        matrix.postTranslate(translateX, translateY);
        binding.ivFullImage.setImageMatrix(matrix);
        binding.ivFullImage.setScaleType(android.widget.ImageView.ScaleType.MATRIX);
    }
}
