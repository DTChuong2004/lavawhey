// Đợi cho DOM load xong
document.addEventListener('DOMContentLoaded', function() {
    // Modal xác nhận xóa
    const deleteCategoryModal = new bootstrap.Modal(document.getElementById('deleteCategoryModal'));

    // Hàm xác nhận xóa danh mục - gán vào window để có thể gọi từ bên ngoài
    window.confirmDeleteCategory = function(index, name) {
        document.getElementById('deleteCategoryName').textContent = name;
        document.getElementById('deleteCategoryIndex').value = index;
        deleteCategoryModal.show();
    };

    // Xử lý sự kiện xóa danh mục
    document.getElementById('confirmDeleteCategory').addEventListener('click', async function() {
    try {
        const index = document.getElementById('deleteCategoryIndex').value;
        
        // Hiển thị loading
        Swal.fire({
            title: 'Đang xóa...',
            text: 'Vui lòng chờ trong giây lát',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        // Xóa danh mục trên Firebase
        await firebase.database().ref('categories').child(index).remove();
        
        // Đóng modal xác nhận
        deleteCategoryModal.hide();
        
        // Hiển thị thông báo thành công
        await Swal.fire({
            title: 'Đã xóa!',
            text: 'Danh mục đã được xóa thành công',
            icon: 'success',
            confirmButtonColor: '#FF6B00'
        });
        
        // Tải lại danh sách danh mục
        await loadCategories();
        
    } catch (error) {
        console.error('Error deleting category:', error);
        Swal.fire({
            title: 'Lỗi!',
            text: 'Không thể xóa danh mục. Vui lòng thử lại',
            icon: 'error',
            confirmButtonColor: '#FF6B00'
        });
    }
});
