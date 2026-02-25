package com.example.imagegallery;

import android.content.Context;
import android.net.Uri;
import android.view.LayoutInflater;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.DiffUtil;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.bumptech.glide.load.resource.drawable.DrawableTransitionOptions;
import com.example.imagegallery.databinding.ItemImageBinding;

import java.util.ArrayList;
import java.util.List;

/**
 * RecyclerView adapter for displaying a grid of selected images.
 * Uses Glide for efficient image loading with thumbnails.
 */
public class ImageAdapter extends RecyclerView.Adapter<ImageAdapter.ImageViewHolder> {

    public interface OnImageActionListener {
        void onImageClick(Uri imageUri, int position);
        void onImageRemove(Uri imageUri, int position);
    }

    private final Context context;
    private final OnImageActionListener listener;
    private List<Uri> images = new ArrayList<>();

    public ImageAdapter(Context context, OnImageActionListener listener) {
        this.context = context;
        this.listener = listener;
    }

    public void setImages(List<Uri> newImages) {
        DiffUtil.DiffResult diffResult = DiffUtil.calculateDiff(new DiffUtil.Callback() {
            @Override public int getOldListSize() { return images.size(); }
            @Override public int getNewListSize() { return newImages.size(); }

            @Override
            public boolean areItemsTheSame(int oldPos, int newPos) {
                return images.get(oldPos).equals(newImages.get(newPos));
            }

            @Override
            public boolean areContentsTheSame(int oldPos, int newPos) {
                return images.get(oldPos).equals(newImages.get(newPos));
            }
        });
        images = new ArrayList<>(newImages);
        diffResult.dispatchUpdatesTo(this);
    }

    @NonNull
    @Override
    public ImageViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        ItemImageBinding binding = ItemImageBinding.inflate(
            LayoutInflater.from(parent.getContext()), parent, false
        );
        return new ImageViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull ImageViewHolder holder, int position) {
        Uri imageUri = images.get(position);
        holder.bind(imageUri, position);
    }

    @Override
    public int getItemCount() {
        return images.size();
    }

    class ImageViewHolder extends RecyclerView.ViewHolder {
        private final ItemImageBinding binding;

        ImageViewHolder(ItemImageBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }

        void bind(Uri imageUri, int position) {
            // Load thumbnail with Glide - uses thumbnail for fast loading
            Glide.with(context)
                .load(imageUri)
                .thumbnail(0.3f)                     // Load 30% size first for quick display
                .transition(DrawableTransitionOptions.withCrossFade(200))
                .placeholder(R.drawable.ic_image_placeholder)
                .error(R.drawable.ic_image_placeholder)
                .centerCrop()
                .into(binding.ivThumbnail);

            // Show file name from URI
            String name = getFileNameFromUri(imageUri);
            binding.tvImageName.setText(name);

            // Click to view full image
            binding.getRoot().setOnClickListener(v -> {
                if (listener != null) listener.onImageClick(imageUri, getAdapterPosition());
            });

            // Remove button
            binding.btnRemove.setOnClickListener(v -> {
                if (listener != null) listener.onImageRemove(imageUri, getAdapterPosition());
            });
        }

        private String getFileNameFromUri(Uri uri) {
            String path = uri.getPath();
            if (path != null) {
                int lastSlash = path.lastIndexOf('/');
                if (lastSlash >= 0 && lastSlash < path.length() - 1) {
                    return path.substring(lastSlash + 1);
                }
            }
            return uri.getLastPathSegment() != null ? uri.getLastPathSegment() : "תמונה";
        }
    }
}
