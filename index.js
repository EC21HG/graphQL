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
  result.textContent = JSON.stringify(graphqlData, null, 2);
  form.classList.add('hidden')
  const card = document.getElementById('result')
  card.classList.remove('hidden')


  const html = `
  <div class="card-inner">
  <h2>Hi ${user.firstName}</h2>
  <p>User : ${user.login}</p>
  <p> <strong> Total Up :</strong> ${user.totalUp}</p>
  <p> <strong> Total Down:</strong> ${user.totalDown}</p>
  <p> <strong> Your actual lvl is :</strong> ${level}</p>
  <h3> Transactions (eventId: 148) </h3>
  <ul> ${transactions.map(tx => `
    <li>
    <strong> ${tx.type}</strong> : ${tx.amount} (today ${new Date(tx.createdAt).toLocaleDateString()})
    </li>
    `).join('')}
    </ul>
  </div>
  `
  result.innerHTML = html
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
