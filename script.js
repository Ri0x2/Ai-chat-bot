const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const toggleThemeBtn = document.querySelector(".toggleThemeBtn");
const deleteBtn = document.querySelector('#deleteBtn')
const suggestion = document.querySelectorAll('.suggestions-list .suggestion')
const deleteConfirmContainer = document.querySelector('.deleteConfirmContainer')

let userMessage = null;
let isResponseGenerating = false;
const API_KEY = "AIzaSyBVCkgI9DA8eogBYSO3AkXPcG2fI5_cvJ0"
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`

const loadLocalStorageData = () =>{
    const savedChats = localStorage.getItem("savedChats")
    const isLightMode = (localStorage.getItem('themeColor')=== 'light_mode')
    document.body.classList.toggle('light_mode' , isLightMode)
    toggleThemeBtn.innerText = isLightMode ? "dark_mode" : "light_mode";
    chatList.innerHTML = savedChats || ""
    chatList.scrollTop = chatList.scrollHeight;
    document.body.classList.toggle('hide-header' , savedChats)
}

const creatMessageElement = (content, ...classes) => {
    const div = document.createElement('div');
    div.classList.add('message', ...classes);
    div.innerHTML = content;
    return div;
    
};


const showTypingEffect = (text, textElement) => {

     // Replace Markdown formatting with HTML tags
     text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Bold
     text = text.replace(/\*(.*?)\*/g, '<em>$1</em>'); // Italic
     text = text.replace(/\n/g, '<br>'); // Line breaks


    const words = text.split(' ');
    let currentWord = 0;
    const typingInterval = setInterval(() => {
        textElement.innerHTML += (currentWord === 0 ? '' : ' ') + words[currentWord++];

        chatList.scrollTop = chatList.scrollHeight;
        if(currentWord === words.length){
            clearInterval(typingInterval);
            isResponseGenerating = false;
            localStorage.setItem("savedChats" , chatList.innerHTML)
            chatList.scrollTop = chatList.scrollHeight;
        }
    }, 75);

}
const generateAPIResponse = async (incomingMessageDiv) => {

    const textElement = incomingMessageDiv.querySelector('.text')

    try{

        const response = await fetch(API_URL , {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents:[{
                    role: "user",
                    parts: [{text: userMessage}]
                }]
            })
        });

        const data = await response.json();
        if(!response.ok) throw new Error(data.error.message)
        
        const apiResponse = data?.candidates[0].content.parts[0].text;
        showTypingEffect (apiResponse , textElement);
       

    }catch(error){
        isResponseGenerating = false
        textElement.innerHTML = error.message
        textElement.classList.add("error")
    }finally{
        incomingMessageDiv.classList.remove('loading')
    }
}

const showLoadingAnimation = () =>{
    const html = `
     <div class="message-container">
                <div class="message-content">
                    <img src="./d0073aea63e7f53a6b8aebe065ff82ca.jpg" alt="Rio-image" class="avatar">
                    <p class="text"> </p>
                    <div class="loading-indecator">
                        <div class="loading-bar"></div>
                        <div class="loading-bar"></div>
                        <div class="loading-bar"></div>
                    </div>
                </div>
                <span onclick="copyMessage(this)" class="icon material-symbols-outlined">
                    content_copy</span>
            </div>
`

const incomingMessageDiv = creatMessageElement(html, 'incoming', 'loading');
    chatList.appendChild(incomingMessageDiv);
    chatList.scrollTop = chatList.scrollHeight;
    generateAPIResponse(incomingMessageDiv);

}

suggestion.forEach(suggestion => {
    suggestion.addEventListener('click', () => {
        userMessage = suggestion.querySelector('.text').innerText
        handleOutingChat();
    })
})

const copyMessage = (copyIcon) =>{
    const messageText = copyIcon.parentElement.querySelector(".text").innerHTML
    navigator.clipboard.writeText(messageText)
    copyIcon.innerText= 'done'
    setTimeout(()=>{
        copyIcon.innerText= 'content_copy'
    },1000)
}

const handleOutingChat =() => {
    userMessage = typingForm.querySelector('.typing-input').value.trim() || userMessage;
    if(!userMessage ||  isResponseGenerating) return;

    isResponseGenerating = true

   const html = `
        <div class="message-content">
            <p class="text">${userMessage}</p>
            <img src="./ba1c796fc180a9a2ea9a3105530f35ee.jpg" alt="user-image" class="avatar">
        </div>
   `

    const outgoingMessageDiv =  creatMessageElement(html , 'outgoing');
    outgoingMessageDiv.querySelector('.text').textContent = userMessage;
    chatList.appendChild(outgoingMessageDiv);

    typingForm.reset();
    chatList.scrollTop = chatList.scrollHeight;
    document.body.classList.add('hide-header')
    setTimeout(showLoadingAnimation , 500)
}

toggleThemeBtn.addEventListener('click' , ()=>{
  const isLightMode =   document.body.classList.toggle('light_mode')
  localStorage.setItem('themeColor' , isLightMode ? "light_mode" : "dark_mode" )
})

deleteBtn.addEventListener('click', () => {
    deleteConfirmContainer.style.display = 'flex'
    document.querySelector('.confirmBtn').addEventListener('click', () => {
        chatList.innerHTML = "";
        deleteConfirmContainer.style.display = 'none'
        localStorage.removeItem('savedChats');
    });
    document.querySelector('.cancelBtn').addEventListener('click', () => {
        deleteConfirmContainer.style.display = 'none'   
    });
});

loadLocalStorageData()
typingForm.addEventListener("submit", (e) => {
    e.preventDefault();

    handleOutingChat();

})


