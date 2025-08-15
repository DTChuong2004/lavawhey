document.addEventListener('DOMContentLoaded', function() {
    // Lấy các phần tử cần thiết
    const menuToggle = document.createElement('button');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelector('.nav-links');
    const logo = document.querySelector('.logo');
    
    // Chèn nút menu vào đầu navbar
    navbar.insertBefore(menuToggle, logo);
    
    // Xử lý sự kiện click menu
    menuToggle.addEventListener('click', function() {
        navLinks.classList.toggle('show');
        this.classList.toggle('active');
    });

    // Đóng menu khi click bên ngoài
    document.addEventListener('click', function(event) {
        const isClickInside = navbar.contains(event.target);
        
        if (!isClickInside && navLinks.classList.contains('show')) {
            navLinks.classList.remove('show');
            menuToggle.classList.remove('active');
        }
    });

    // Đóng menu khi click vào link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('show');
            menuToggle.classList.remove('active');
        });
    });
});
