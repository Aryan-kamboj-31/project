// document.addEventListener('DOMContentLoaded', function () {
//     if (document.getElementById('statusChart')) {
//         const ctx = document.getElementById('statusChart').getContext('2d');
//         const statusChart = new Chart(ctx, {
//             type: 'pie',
//             data: {
//                 labels: ['Applied', 'Interviewing', 'Offer', 'Rejected'],
//                 datasets: [{
//                     label: 'Applications by Status',
//                     data: [10, 5, 2, 1], // Replace with dynamic data
//                     backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
//                     borderColor: ['#fff'],
//                     borderWidth: 1
//                 }]
//             }
//         });
//     }
// });
// document.addEventListener('DOMContentLoaded', () => {
//     // Smooth scroll for navigation links
//     document.querySelectorAll('nav a').forEach(anchor => {
//         anchor.addEventListener('click', function (e) {
//             e.preventDefault();

//             document.querySelector(this.getAttribute('href')).scrollIntoView({
//                 behavior: 'smooth'
//             });
//         });
//     });

//     // Modal for features explanation
//     const modal = document.getElementById('modal');
//     const modalContent = document.getElementById('modal-content');
//     const modalClose = document.getElementById('modal-close');

//     document.querySelectorAll('.features ul li').forEach(item => {
//         item.addEventListener('click', function () {
//             const featureDescription = this.textContent;
//             modalContent.textContent = `More details about ${featureDescription}`;
//             modal.style.display = 'block';
//         });
//     });
//     window.addEventListener('click', (e) => {
//         if (e.target == modal) {
//             modal.style.display = 'none';
//         }
//     });
// });

