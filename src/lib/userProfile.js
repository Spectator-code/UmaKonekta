'use client';

/**
 * @file userProfile.js
 * @description Utility module for user profile photo storage, optimization, and fallback recovery.
 * @module userProfile
 */

import { useState, useEffect, useCallback } from 'react';
import { useConfirm } from '@/components/ConfirmDialogProvider';

export const MAX_PHOTO_SIZE_MB = 5;
export const MAX_PHOTO_SIZE_BYTES = MAX_PHOTO_SIZE_MB * 1024 * 1024; // 5,242,880 bytes

/**
 * Generate a consistent storage key for the current user's profile photo
 */
export function getProfileStorageKey(user) {
  if (!user) return 'umakonekta_avatar_guest';
  const id = user.registryId || user.id || user.email || user.name || 'default';
  return `umakonekta_avatar_${id}`;
}

/**
 * Get the stored profile photo data URL from localStorage with corruption resilience
 */
export function getStoredUserPhoto(user) {
  if (typeof window === 'undefined') return null;
  try {
    const key = getProfileStorageKey(user);
    const val = localStorage.getItem(key);
    
    // Corrupted data handling: verify it's a valid data URL or safe URL path
    if (!val || typeof val !== 'string') return null;
    if (!val.startsWith('data:image/') && !val.startsWith('http') && !val.startsWith('/')) {
      console.warn('Corrupted avatar data detected in storage, resetting to default standard avatar.');
      try { localStorage.removeItem(key); } catch (e) {}
      return null;
    }
    return val;
  } catch (err) {
    console.error('Failed to retrieve user profile photo, falling back to default:', err);
    return null;
  }
}

/**
 * Save user profile photo to localStorage with auto-pruning to prevent QuotaExceededError
 */
export function saveStoredUserPhoto(user, dataUrl) {
  if (typeof window === 'undefined') return false;
  try {
    const key = getProfileStorageKey(user);
    try {
      localStorage.setItem(key, dataUrl);
    } catch (quotaError) {
      // Quota exceeded: prune other cached avatars to free space
      console.warn('LocalStorage quota reached. Pruning stale avatar caches...');
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('umakonekta_avatar_') && k !== key) {
          localStorage.removeItem(k);
        }
      }
      localStorage.setItem(key, dataUrl);
    }

    window.dispatchEvent(
      new CustomEvent('umakonekta_avatar_updated', {
        detail: { key, photo: dataUrl }
      })
    );
    return true;
  } catch (err) {
    console.error('Failed to save user profile photo to browser storage:', err);
    return false;
  }
}

/**
 * Remove user profile photo from localStorage and notify all components
 */
export function removeStoredUserPhoto(user) {
  if (typeof window === 'undefined') return false;
  try {
    const key = getProfileStorageKey(user);
    localStorage.removeItem(key);
    window.dispatchEvent(
      new CustomEvent('umakonekta_avatar_updated', {
        detail: { key, photo: null }
      })
    );
    return true;
  } catch (err) {
    console.error('Failed to remove user profile photo:', err);
    return false;
  }
}

/**
 * Validate and process an uploaded image file:
 * - Checks 5MB file size limit
 * - Checks valid image MIME type
 * - Resizes to 384x384 maximum avatar dimensions and 0.82 JPEG quality
 *   to ensure ultra-compact storage (<40KB) and prevent storage quota exhaustion
 */
export function processPhotoFile(file, maxSizeMB = MAX_PHOTO_SIZE_MB) {
  return new Promise((resolve) => {
    if (!file) {
      return resolve({ error: 'No file selected.' });
    }

    // 1. Validate Image Type
    if (!file.type.startsWith('image/')) {
      return resolve({
        error: 'Invalid file format. Please upload an image (PNG, JPG, JPEG, WEBP, or GIF).'
      });
    }

    // 2. Validate File Size Limit (5MB)
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      const actualSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return resolve({
        error: `File size exceeds the ${maxSizeMB}MB limit (Selected file: ${actualSizeMB} MB). Please choose a photo under 5MB.`
      });
    }

    // 3. Read and optimize image via Canvas
    const reader = new FileReader();
    reader.onerror = () => {
      resolve({ error: 'Failed to read image file. Please try another file.' });
    };

    reader.onload = (e) => {
      const rawDataUrl = e.target?.result;
      if (!rawDataUrl) {
        return resolve({ error: 'Failed to process image data.' });
      }

      const img = new Image();
      img.onerror = () => {
        resolve({ error: 'Invalid or corrupt image file.' });
      };

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_DIM = 384; // Optimized for avatars without excessive byte payload
          let { width, height } = img;

          if (width > height) {
            if (width > MAX_DIM) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve({ error: 'Browser graphics acceleration unavailable.' });
          }

          // Draw and compress to compact high-quality JPEG (<40KB typical)
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve({ dataUrl: compressedDataUrl });
        } catch (canvasErr) {
          console.error('Canvas processing failed:', canvasErr);
          resolve({ error: 'Unable to optimize image. Please try a different photo.' });
        }
      };

      img.src = rawDataUrl;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Custom React Hook to manage user profile photo state and real-time updates
 */
export function useUserProfilePhoto(user) {
  const confirm = useConfirm();
  const [photo, setPhoto] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const key = getProfileStorageKey(user);

  // Sync photo from storage
  useEffect(() => {
    setPhoto(getStoredUserPhoto(user));

    function handleAvatarEvent(e) {
      if (e.detail && e.detail.key === key) {
        setPhoto(e.detail.photo);
      }
    }

    function handleStorageEvent(e) {
      if (e.key === key) {
        setPhoto(e.newValue);
      }
    }

    window.addEventListener('umakonekta_avatar_updated', handleAvatarEvent);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener('umakonekta_avatar_updated', handleAvatarEvent);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [key, user]);

  const uploadPhoto = useCallback(
    async (file) => {
      setErrorMessage('');
      setSuccessMessage('');
      setIsUploading(true);

      const result = await processPhotoFile(file, MAX_PHOTO_SIZE_MB);

      if (result.error) {
        setErrorMessage(result.error);
        setIsUploading(false);
        return false;
      }

      if (result.dataUrl) {
        const saved = saveStoredUserPhoto(user, result.dataUrl);
        if (saved) {
          setPhoto(result.dataUrl);
          setSuccessMessage('Profile photo updated successfully!');
          setTimeout(() => setSuccessMessage(''), 3500);
        } else {
          setErrorMessage('Unable to save photo to browser storage (quota exceeded).');
        }
      }

      setIsUploading(false);
      return true;
    },
    [user]
  );

  const removePhoto = useCallback(() => {
    confirm({
      title: 'Remove Profile Photo',
      message: 'Are you sure you want to remove your profile photo? This action cannot be undone.',
      onConfirm: () => {
        setErrorMessage('');
        removeStoredUserPhoto(user);
        setPhoto(null);
        setSuccessMessage('Profile photo removed.');
        setTimeout(() => setSuccessMessage(''), 3500);
      }
    });
  }, [user, confirm]);

  const clearMessages = useCallback(() => {
    setErrorMessage('');
    setSuccessMessage('');
  }, []);

  return {
    photo,
    isUploading,
    errorMessage,
    successMessage,
    uploadPhoto,
    removePhoto,
    clearMessages,
    maxSizeMB: MAX_PHOTO_SIZE_MB
  };
}
