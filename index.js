const form = document.getElementById('login-form');
const result = document.getElementById('result');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const text = document.getElementById('text').value.trim();
  const password = document.getElementById('password').value.trim();
  const credentials = btoa(`${text}:${password}`)

  const signinR = await fetch('https://zone01normandie.org/api/auth/signin', {
    method: 'POST',
    headers: { 
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({ text, password })
  });

  if (!signinR.ok) {
  const errorText = await signinR.text();
  console.error("Erreur AUTH", signinR.status, errorText);
  result.textContent = `Erreur d'authentification (${signinR.status}) : ${errorText}`;
  return;
}

let token = await signinR.text();
token = token.replace(/^"|"$/g, '').trim();
console.log("Auth:",token)


  const graphqlR = await fetch('https://zone01normandie.org/api/graphql-engine/v1/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      query: `
        query {
            user{
                id 
                login
              	attrs
                totalUp
                totalDown
                transactions ( where: {eventId: {_eq: 148}}, order_by: {createdAt:asc}){
                amount
                type
                createdAt
                }
            }

  group {
    path
    status
  }

  # result {
  #   id
  #   path
  #   createdAt
  #   updatedAt
  #   isLast
  #   user {
  #     id
  #     login
  #   }
  # }
  
#   progress {
#     id
#     createdAt
#     updatedAt
#     eventId
#     path
    
#   }
  
              transaction(where: {
                _and: [
                  { type: { _eq: "xp" } },
                  { eventId: { _eq: 303 } }
                ]
              }) {
                amount
                createdAt
                path
              }
  

  event_user(where: { userId: { _eq: 3634 }, eventId: { _eq: 303 } }) {
                      level
                  }
        }
      `
    })
  });

  const graphqlData = await graphqlR.json();
  const user = graphqlData.data.user[0]
  const transactions = user.transactions
  const level = graphqlData.data.event_user[0]?.level
  // result.textContent = JSON.stringify(graphqlData, null, 2);
  form.classList.add('hidden')
  const card = document.getElementById('result')
  card.classList.remove('hidden')

  const xpTransactions = graphqlData.data.transaction;
const xpData = xpTransactions.map(tx => ({
  date: new Date(tx.createdAt).toLocaleDateString(),
  xp: tx.amount
}));


  const groupCards = graphqlData.data.group.map(group =>
   `
   <div class="group-card">
   <p> <strong> Path: </strong> ${group.path}</p>
   <p> <strong> Status: </strong> ${group.status}</p>
   </div>
   `).join('');

  const html = `
  <div class="card-inner">
  <h2>Hi ${user.attrs.firstName}</h2>
  <p><strong> User </strong> : ${user.login}</p>
  <p> <strong> Actual Ratio: </strong>${(user.totalUp / user.totalDown).toFixed(2)} Xp</p>
  <p> <strong> Your actual lvl is : </strong> ${level} Congrats !</p>
  <ul> ${transactions.map(tx => `
    <li>
    <strong> ${tx.type}</strong> : ${tx.amount} (today ${new Date(tx.createdAt).toLocaleDateString()})
    </li>
    `).join('')}
    </ul>
    <div class="group-scroll">
      ${groupCards}
    </div>
    </div>
  `  
  result.innerHTML = html
  
  Chart.defaults.color='black'
  
  const ctx = document.getElementById('xpChart').getContext('2d');

let cumulativeXP = 0;
const xpCumulativeData = xpData.map(item => {
  cumulativeXP += item.xp;
  return {
    date: item.date,
    totalXP: cumulativeXP
  };
});

const ctx2 = document.getElementById('xpBarChart').getContext('2d');

new Chart(ctx2, {
  type: 'line',
  data: {
    labels: xpCumulativeData.map(item => item.date),
    datasets: [{
      label: 'Cumulative XP over time',
      data: xpCumulativeData.map(item => item.totalXP),
      fill: true,
      borderColor: 'rgb(27, 81, 81)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.2
    }]
  },
  options: {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Cumulative XP'
        },
        beginAtZero: true
      }
    }
  }
});


new Chart(ctx, {
  type: 'line',
  data: {
    labels: xpData.map(item => item.date),
    datasets: [{
      label: 'XP over time',
      data: xpData.map(item => item.xp),
      fill: false,
      borderColor: 'rgb(48, 111, 111)',
      tension: 0.1
    }]
  },
  options: {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        title: {
          display: true,
          text: 'XP'
        }
      }
    }
  }
});

});


// const query = `
//   query {
//     user {
//       login
//       transactions(
//         where: { eventId: { _eq: 148 } }
//         order_by: { createdAt: asc }
//       ) {
//         amount
//         type
//         createdAt
//       }
//     }
//     event_user(
//       where: { userId: { _eq: 3634 }, eventId: { _eq: 303 } }
//     ) {
//       level
//     }
//   }
// `;

  // <div class="auditdo">
  // <h2> Here is your next audit ${audit.private.code} do it before ${audit.endAt} </h2>
  // </div>

  // <div class ="projectd"> 
  // <h2> Here is what you've done until now </h2>
  // <p> And here is 
  // </div>