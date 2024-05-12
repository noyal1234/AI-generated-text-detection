// document.getElementById('Button').addEventListener('click',()=>{
//     document.getElementById('thathank-you').style.opacity=1;
//     console.log('Button clicked')
// })
document.getElementById('contact-form').addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent form submission

    // Display the thank you message
    document.getElementById('thank-you').style.display = 'block';
});
