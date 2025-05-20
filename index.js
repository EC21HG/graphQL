const graphEnd = 'https://zone01normandie.org/api/graphql-engine/v1/graphql';
const form = document.getElementById('form');
const result = document.getElementById('result');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Étape 1 : Authentification
  const signinR = await fetch('https://zone01normandie.org/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!signinR.ok) {
    result.textContent = "Auth Failed";
    return;
  }

  const { token } = await signinR.json();

  // Étape 2 : Requête GraphQL
  const graphqlR = await fetch(graphEnd, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      query: `
        query {
          user {
            login
            transactions(
              where: { eventId: { _eq: 148 } }
              order_by: { createdAt: asc }
            ) {
              amount
              type
              createdAt
            }
          }
          event_user(
            where: { userId: { _eq: 3634 }, eventId: { _eq: 303 } }
          ) {
            level
          }
        }
      `
    })
  });

  const graphqlData = await graphqlR.json();
  result.textContent = JSON.stringify(graphqlData, null, 2);
});


const query = `
  query {
    user {
      login
      transactions(
        where: { eventId: { _eq: 148 } }
        order_by: { createdAt: asc }
      ) {
        amount
        type
        createdAt
      }
    }
    event_user(
      where: { userId: { _eq: 3634 }, eventId: { _eq: 303 } }
    ) {
      level
    }
  }
`;
