const saved = document.getElementById("saved");
      saved.addEventListener("click", () => {

        window.location.href = "/user";
      });

      const socket = io();

      const liveUsersBtn = document.getElementById("liveUsersBtn");
      const userList = document.getElementById("userList");

      liveUsersBtn.addEventListener("click", () => {
        userList.style.display = userList.style.display === "none" ? "block" : "none";
      });

      socket.on('user_list', (users) => {
        userList.innerHTML = '';
        users.forEach(user => {
          const li = document.createElement('li');
          li.textContent = `${user.email} (Socket ID: ${user.socketId})`;
          li.addEventListener('click', () => {
            fetch('/getUser')
              .then(response => response.json())
              .then(data => {
                const clickedUser = data.find(u => u.socketId === user.socketId);
                if (clickedUser) {
                  userList.innerHTML = `
                    <p><strong>First Name:</strong> ${clickedUser.firstName}</p>
                    <p><strong>Last Name:</strong> ${clickedUser.lastName}</p>
                    <p><strong>Mobile No:</strong> ${clickedUser.mobile}</p>
                    <p><strong>Email:</strong> ${clickedUser.email}</p>
                    <p><strong>Street:</strong> ${clickedUser.street}</p>
                    <p><strong>City:</strong> ${clickedUser.city}</p>
                    <p><strong>State:</strong> ${clickedUser.state}</p>
                    <p><strong>Country:</strong> ${clickedUser.country}</p>
                    <p><strong>Login ID:</strong> ${clickedUser.login}</p>
                  `;
                  userData.style.display = 'block';
                }
              });
          });
          userList.appendChild(li);
        });
      });
      document.getElementById('myform').addEventListener('submit', (event) => {
        event.preventDefault();
        confirmationMessage.style.display = 'block';
        
        const user = {
          firstName: document.getElementById('firstName').value,
          lastName: document.getElementById('lastName').value,
          mobile: document.getElementById('mobile').value,
          email: document.getElementById('email').value,
          street: document.getElementById('street').value,
          city: document.getElementById('city').value,
          state: document.getElementById('state').value,
          country: document.getElementById('country').value,
          login: document.getElementById('loginId').value,
          password: document.getElementById('password').value
        };
        
        socket.emit('new_user', user);
        document.getElementById('myform')
      });