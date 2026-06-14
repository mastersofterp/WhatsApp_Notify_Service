import cloudinary
import cloudinary.uploader
from config import Config
import logging

logger = logging.getLogger(__name__)

cloudinary.config(
    cloud_name=Config.CLOUDINARY_CLOUD_NAME,
    api_key=Config.CLOUDINARY_API_KEY,
    api_secret=Config.CLOUDINARY_API_SECRET
)

class CloudinaryUploader:
    def __init__(self):
        self.folder = "whatsapp-saas"
        self.max_file_size = 5 * 1024 * 1024  # 5MB
        self.allowed_formats = ['jpg', 'jpeg', 'png', 'webp']
    
    def validate_file(self, file):
        """Validate file size and type"""
        try:
            # Check file size
            file.seek(0, 2)  # Seek to end
            file_size = file.tell()
            file.seek(0)  # Reset to beginning
            
            if file_size > self.max_file_size:
                return False, f"File size exceeds {self.max_file_size / (1024*1024)}MB limit"
            
            # Check file extension
            filename = file.filename if hasattr(file, 'filename') else ''
            if filename:
                ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
                if ext not in self.allowed_formats:
                    return False, f"File type not allowed. Allowed: {', '.join(self.allowed_formats)}"
            
            return True, "Valid"
        except Exception as e:
            return False, str(e)
    
    def upload_image(self, file_path_or_url, public_id=None, business_id=None):
        """Upload image to Cloudinary"""
        try:
            # Set folder with business_id if provided
            folder = f"{self.folder}/{business_id}/menu" if business_id else self.folder
            
            upload_options = {
                'folder': folder,
                'resource_type': 'image',
                'quality': 'auto',
                'fetch_format': 'auto'
            }
            
            if public_id:
                upload_options['public_id'] = public_id
            
            result = cloudinary.uploader.upload(file_path_or_url, **upload_options)
            
            logger.info(f"Image uploaded successfully: {result['secure_url']}")
            return {
                'success': True,
                'url': result['secure_url'],
                'public_id': result['public_id']
            }
            
        except Exception as e:
            logger.error(f"Error uploading image: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def delete_image(self, public_id):
        """Delete image from Cloudinary"""
        try:
            result = cloudinary.uploader.destroy(public_id)
            logger.info(f"Image deleted: {public_id}")
            return result['result'] == 'ok'
        except Exception as e:
            logger.error(f"Error deleting image: {str(e)}")
            return False
    
    def upload_base64_image(self, base64_string, public_id=None):
        """Upload base64 encoded image"""
        try:
            upload_options = {
                'folder': self.folder,
                'resource_type': 'image'
            }
            
            if public_id:
                upload_options['public_id'] = public_id
            
            result = cloudinary.uploader.upload(f"data:image/png;base64,{base64_string}", **upload_options)
            
            return {
                'success': True,
                'url': result['secure_url'],
                'public_id': result['public_id']
            }
            
        except Exception as e:
            logger.error(f"Error uploading base64 image: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

cloudinary_uploader = CloudinaryUploader()
