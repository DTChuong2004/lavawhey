// Wait for Firebase to be initialized before accessing database
let database;
function initializeFirebaseDatabase() {
    if (!firebase.apps.length) {
        throw new Error('Firebase has not been initialized');
    }
    database = firebase.database();
}

// Function để xử lý hiển thị danh mục
function handleCategoryDisplay(showSingleCategory, targetCategoryId) {
    // Xử lý hiển thị danh mục sản phẩm
    document.querySelectorAll('.product-category').forEach(cat => {
        cat.style.display = showSingleCategory ? 
            (cat.id === targetCategoryId ? 'block' : 'none') : 'block';
    });

    // Xử lý hiển thị danh sách danh mục trong sidebar
    const categoryList = document.querySelector('.category-list');
    if (categoryList) {
        categoryList.querySelectorAll('li').forEach(li => {
            const link = li.querySelector('a');
            // Kiểm tra xem link có href không và lấy category ID
            const linkCategory = link?.getAttribute('href')?.replace('#', '');
            
            // Hiển thị mục "Tất cả" và danh mục được chọn
            li.style.display = (!showSingleCategory || 
                              linkCategory === 'all' || 
                              linkCategory === targetCategoryId) ? 'block' : 'none';
            
            // Cập nhật trạng thái active
            if (link) {
                if (showSingleCategory) {
                    link.classList.toggle('active', linkCategory === targetCategoryId);
                }
            }
        });
    }
}

// Hàm lọc và highlight sản phẩm theo từ khóa
async function filterAndHighlightProducts(searchKeyword) {
    try {
        // Đảm bảo searchKeyword không rỗng
        if (!searchKeyword || searchKeyword.trim() === '') return;
        
        searchKeyword = searchKeyword.toLowerCase().trim();

        // Lấy tất cả danh mục từ Firebase
        const snapshot = await firebase.database().ref('categories').once('value');
        const categories = snapshot.val();

        let firstMatchingProduct = null;
        let firstMatchingCategory = null;

        // Reset trạng thái highlight của tất cả sản phẩm và hiển thị tất cả danh mục
        document.querySelectorAll('.product-card').forEach(card => {
            card.style.boxShadow = '';
            card.style.transform = '';
            card.style.display = '';
        });
        document.querySelectorAll('.product-category').forEach(category => {
            category.style.display = '';
        });

        // Duyệt qua từng danh mục
        Object.entries(categories).forEach(([categoryId, category]) => {
            const categoryElement = document.getElementById(categoryId);
            if (!categoryElement) return;

            const isCategoryMatch = category.name.toLowerCase().includes(searchKeyword);
            let hasMatchingProducts = false;

            // Kiểm tra và highlight sản phẩm trong danh mục
            const productCards = categoryElement.querySelectorAll('.product-card');
            productCards.forEach(card => {
                const productName = card.querySelector('h3')?.textContent.toLowerCase() || '';
                const productDesc = card.querySelector('.description')?.textContent.toLowerCase() || '';
                
                const isProductMatch = productName.includes(searchKeyword) || 
                                     productDesc.includes(searchKeyword);

                if (isProductMatch) {
                    hasMatchingProducts = true;
                    card.style.boxShadow = '0 0 15px rgba(255, 107, 0, 0.5)';
                    card.style.transform = 'translateY(-5px)';
                    card.style.transition = 'all 0.3s ease';
                    
                    // Lưu sản phẩm đầu tiên tìm thấy
                    if (!firstMatchingProduct) {
                        firstMatchingProduct = card;
                    }
                } else {
                    card.style.boxShadow = '';
                    card.style.transform = '';
                }
            });

            // Xử lý hiển thị danh mục
            if (isCategoryMatch || hasMatchingProducts) {
                categoryElement.style.display = 'block';
                if (!firstMatchingCategory) {
                    firstMatchingCategory = categoryElement;
                }
            } else {
                categoryElement.style.display = 'none';
            }
        });

        // Cuộn đến vị trí phù hợp
        if (firstMatchingProduct || firstMatchingCategory) {
            // Đợi DOM cập nhật
            setTimeout(() => {
                const elementToScroll = firstMatchingProduct || firstMatchingCategory;
                const headerOffset = 120; // Chiều cao của header cố định
                const elementPosition = elementToScroll.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Thêm hiệu ứng highlight tạm thời
                if (firstMatchingProduct) {
                    firstMatchingProduct.style.transition = 'all 0.5s ease';
                    firstMatchingProduct.style.boxShadow = '0 0 25px rgba(255, 107, 0, 0.8)';
                    setTimeout(() => {
                        firstMatchingProduct.style.boxShadow = '0 0 15px rgba(255, 107, 0, 0.5)';
                    }, 1000);
                }
            }, 100);
        }

    } catch (error) {
        console.error('Lỗi khi lọc sản phẩm:', error);
    }
}

// Function để xử lý hiển thị danh mục
function handleCategoryDisplay(showSingleCategory, targetCategoryId) {
    // Xử lý hiển thị danh mục sản phẩm
    document.querySelectorAll('.product-category').forEach(cat => {
        cat.style.display = showSingleCategory ? 
            (cat.id === targetCategoryId ? 'block' : 'none') : 'block';
    });

    // Xử lý hiển thị danh sách danh mục trong sidebar
    const categoryList = document.querySelector('.category-list');
    if (categoryList) {
        categoryList.querySelectorAll('li').forEach(li => {
            const link = li.querySelector('a');
            const linkCategory = link?.getAttribute('href')?.substring(1); // Bỏ dấu # ở đầu
            if (showSingleCategory) {
                li.style.display = (linkCategory === targetCategoryId || linkCategory === 'all') ? 'block' : 'none';
            } else {
                li.style.display = 'block';
            }
        });
    }
}

// Xử lý khi trang được tải
window.addEventListener('load', () => {
    // Lấy thông tin từ sessionStorage
    let scrollTarget = null;
    try {
        scrollTarget = JSON.parse(sessionStorage.getItem('scrollTarget'));
        // Xóa thông tin sau khi đã lấy để tránh scroll không mong muốn khi refresh
        sessionStorage.removeItem('scrollTarget');

        // Tự động chọn danh mục nếu có autoSelectCategory
        if (scrollTarget?.autoSelectCategory && scrollTarget?.categoryId) {
            const categoryLinks = document.querySelectorAll('.category-list a');
            categoryLinks.forEach(link => {
                const linkCategory = link.getAttribute('href')?.substring(1);
                if (linkCategory === scrollTarget.categoryId) {
                    // Thêm class active cho danh mục được chọn
                    link.classList.add('active');
                    // Click vào link để kích hoạt sự kiện chọn danh mục
                    link.click();
                } else {
                    link.classList.remove('active');
                }
            });
        }
    } catch (e) {
        console.log('Không có thông tin scroll target trong sessionStorage');
    }

    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = scrollTarget?.searchQuery || urlParams.get('search');
    const categoryId = scrollTarget?.categoryId || urlParams.get('category');
    const productId = scrollTarget?.productId || urlParams.get('product');
    const shouldScroll = urlParams.get('scroll') === 'true';
    const showSingleCategory = scrollTarget?.showSingleCategory || urlParams.get('single') === 'true';

    if (searchQuery && shouldScroll) {
        // Đợi DOM và dữ liệu được tải hoàn toàn
        const waitForContent = setInterval(() => {
            if (document.readyState === 'complete') {
                clearInterval(waitForContent);
                
                // Kiểm tra xem có nên hiển thị một danh mục duy nhất không
                const showSingleCategory = scrollTarget?.showSingleCategory || urlParams.get('single') === 'true';

                // Ẩn tất cả danh mục trước
                document.querySelectorAll('.product-category').forEach(cat => {
                    cat.style.display = showSingleCategory ? 'none' : 'block';
                });

                if (categoryId) {
                    const categoryElement = document.getElementById(categoryId);
                    // Hiển thị danh mục được chọn
                    if (categoryElement) {
                        categoryElement.style.display = 'block';
                    }
                    if (categoryElement) {
                        // Mở rộng danh mục nếu cần
                        const categoryHeader = categoryElement.querySelector('h2');
                        if (categoryHeader && !categoryHeader.classList.contains('active')) {
                            categoryHeader.click();
                        }

                        // Đợi animation mở rộng danh mục hoàn tất
                        setTimeout(() => {
                            if (productId) {
                                const productElement = categoryElement.querySelector(`[data-id="${productId}"]`);
                                if (productElement) {
                                    // Highlight và scroll đến sản phẩm
                                    productElement.style.boxShadow = '0 0 25px rgba(255, 107, 0, 0.8)';
                                    productElement.style.transform = 'translateY(-5px)';
                                    productElement.style.transition = 'all 0.5s ease';

                                    // Scroll đến sản phẩm
                                    const headerOffset = 120;
                                    const elementPosition = productElement.getBoundingClientRect().top;
                                    const offsetPosition = window.pageYOffset + elementPosition - headerOffset;

                                    window.scrollTo({
                                        top: offsetPosition,
                                        behavior: 'smooth'
                                    });

                                    // Thêm hiệu ứng highlight
                                    productElement.style.animation = 'highlight-pulse 2s ease-in-out';
                                    
                                    // Đánh dấu danh mục trong sidebar
                                    const categoryLink = document.querySelector(`.category-list a[data-category="${categoryId}"]`);
                                    if (categoryLink) {
                                        document.querySelectorAll('.category-list a').forEach(a => a.classList.remove('active'));
                                        categoryLink.classList.add('active');
                                    }
                                }
                            } else {
                                // Scroll đến danh mục nếu không có product ID
                                const headerOffset = 120;
                                const elementPosition = categoryElement.getBoundingClientRect().top;
                                const offsetPosition = window.pageYOffset + elementPosition - headerOffset;

                                window.scrollTo({
                                    top: offsetPosition,
                                    behavior: 'smooth'
                                });
                            }
                        }, 300); // Đợi animation mở rộng hoàn tất
                    }
                }

                // Áp dụng bộ lọc cho tất cả kết quả phù hợp
                filterAndHighlightProducts(searchQuery);
            }
        }, 100);
    }
});

// Thêm animation vào <style>
const style = document.createElement('style');
style.textContent = `
@keyframes highlight-pulse {
    0% { box-shadow: 0 0 25px rgba(255, 107, 0, 0.8); }
    50% { box-shadow: 0 0 35px rgba(255, 107, 0, 0.9); }
    100% { box-shadow: 0 0 25px rgba(255, 107, 0, 0.8); }
}`;
document.head.appendChild(style);
