const graphEnd = 'https://zone01normandie.org/api/graphql-engine/v1/graphql'

const query = `
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
        };
`

console.log(query)