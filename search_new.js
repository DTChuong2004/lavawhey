// Cache cho dữ liệu categories
let cachedCategories = null;

// Hàm lấy dữ liệu từ Firebase
async function layDuLieuCategories() {
    if (cachedCategories) {
        return cachedCategories;
    }
    try {
        const response = await fetch('https://lavawhey-default-rtdb.firebaseio.com/categories.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!data) {
            throw new Error('Không có dữ liệu từ Firebase');
        }
        cachedCategories = data;
        return cachedCategories;
    } catch (error) {
        // Xử lý lỗi một cách im lặng, không hiển thị trong console
        return null;
    }
}

// Hàm tìm kiếm sản phẩm (cải thiện)
function timKiemSanPham(categories, tuKhoa) {
    if (!categories || !Array.isArray(categories)) {
        return [];
    }
    tuKhoa = tuKhoa.toLowerCase();
    let ketQua = [];
    
    categories.forEach(danhMuc => {
        if (danhMuc && danhMuc.products && Array.isArray(danhMuc.products)) {
            // Tìm kiếm trong sản phẩm của danh mục
            danhMuc.products.forEach(sanPham => {
                if (sanPham && sanPham.name) {
                    // Tìm theo tên sản phẩm
                    if (sanPham.name.toLowerCase().includes(tuKhoa)) {
                        ketQua.push({
                            ...sanPham,
                            categoryId: danhMuc.id,
                            categoryName: danhMuc.name
                        });
                    }
                    // Tìm theo mô tả sản phẩm
                    else if (sanPham.description && sanPham.description.toLowerCase().includes(tuKhoa)) {
                        ketQua.push({
                            ...sanPham,
                            categoryId: danhMuc.id,
                            categoryName: danhMuc.name
                        });
                    }
                }
            });
            
            // Tìm theo tên danh mục
            if (danhMuc.name && danhMuc.name.toLowerCase().includes(tuKhoa)) {
                danhMuc.products.forEach(sanPham => {
                    if (!ketQua.find(item => item.id === sanPham.id)) {
                        ketQua.push({
                            ...sanPham,
                            categoryId: danhMuc.id,
                            categoryName: danhMuc.name
                        });
                    }
                });
            }
        }
    });
    
    return ketQua;
}

// Hàm khởi tạo tìm kiếm
function khoiTaoTimKiem() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    if (!searchInput || !searchResults) {
        console.error('Không tìm thấy elements tìm kiếm');
        return;
    }

    // Tải dữ liệu categories khi trang load
    layDuLieuCategories();

    // Xử lý sự kiện input
    searchInput.addEventListener('input', async function(e) {
        const tuKhoa = e.target.value.trim();
        
        // Ẩn kết quả nếu input rỗng
        if (!tuKhoa) {
            searchResults.style.display = 'none';
            return;
        }

        // Lấy dữ liệu categories
        const categories = await layDuLieuCategories();
        if (!categories) {
            searchResults.innerHTML = '<div class="no-results">Có lỗi xảy ra khi tải dữ liệu</div>';
            searchResults.style.display = 'block';
            return;
        }

        // Tìm kiếm sản phẩm
        const ketQua = timKiemSanPham(categories, tuKhoa);
        
        // Hiển thị kết quả
        if (ketQua.length > 0) {
            searchResults.innerHTML = ketQua.map(sp => `
                <div class="search-item" data-category="${sp.categoryId}" data-product="${sp.id}">
                    <div class="category-header">
                        <h3>${sp.categoryName}</h3>
                    </div>
                    <div class="product-details">
                        <img src="${sp.image}" alt="${sp.name}" onerror="this.src='https://via.placeholder.com/80x80?text=No+Image'">
                        <div class="search-item-info">
                            <h4>${sp.name}</h4>
                            <p>${sp.description || 'Không có mô tả'}</p>
                            <span class="price">${sp.price.toLocaleString()}đ</span>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            searchResults.innerHTML = '<div class="no-results">Không tìm thấy sản phẩm</div>';
        }
        searchResults.style.display = 'block';

        // Thêm event listeners cho các kết quả tìm kiếm
        document.querySelectorAll('.search-item').forEach(item => {
            item.addEventListener('click', function() {
                const categoryId = this.dataset.category;
                const productId = this.dataset.product;
                
                // Lưu thông tin chi tiết vào sessionStorage để sử dụng sau khi chuyển trang
                const danhMucChua = categories.find(dm => dm.id === categoryId);
                sessionStorage.setItem('scrollTarget', JSON.stringify({
                    categoryId,
                    categoryName: danhMucChua ? danhMucChua.name : '',
                    productId,
                    searchQuery: tuKhoa,
                    showSingleCategory: true,
                    autoSelectCategory: true // Thêm flag để tự động chọn danh mục
                }));

                // Thêm tham số để đánh dấu cần tự động chọn danh mục
                const urlWithAutoSelect = `products.html?category=${categoryId}&search=${encodeURIComponent(tuKhoa)}&product=${productId}&scroll=true&single=true&autoSelect=true`;
                window.location.href = urlWithAutoSelect;
            });
        });
    });

    // Ẩn kết quả khi click ra ngoài
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

// Khởi tạo khi DOM đã load
document.addEventListener('DOMContentLoaded', khoiTaoTimKiem);
