# Crustecan Warrior API Design

Fixture list and user based ticketing system for a fictional football club Crustecan Warrior.

### Specification: REST

_Note: This documentation may not be accurate and will be updated over time._

## Fixtures

### **Data Structure**

```js
{
  _id: String, // MongoDB ObjectId.
  homeTeam: String,
  awayTeam: String,
  event: String,
  date: Date, // Date string.
  isHome: Boolean,
  seats: [
    {
      section: String,
      seatNumber: String,
      isAvailable: Boolean,
    }
  ],
  isTicketAvailable: Boolean, // State changes occur on each successful checkout in order to avoid seats array checking on each query.
}
```

#### Example:

```js
{
  _id: 'abcdefghjijkl',
  homeTeam: 'Crustecan Warrior',
  awayTeam: 'Fluorascent FC',
  event: 'Premier League',
  date: '2021-11-19T09:59:53.470Z', // Date string.
  isHome: true,
  seats: [
    {
      section: 'A',
      seatNumber: '001-0100',
      isAvailable: true
    },
    {
      section: 'A',
      seatNumber: '001-0101',
      isAvailable: false,
    }
  ],
  isTicketAvailable: true,
}
```

### **List All Fixtures**

List all fixtures. Default to the next fixtures ranging to three months ahead.

### Endpoint

```
GET /api/fixture
```

### Parameters

- `increment` **Required**  
  Type: `Number`  
  Default: 1  
  Current data incrementation. Each call will return 3 fixtures by default and will increment based on that limits.
- `includeSeat` _Optional_  
  Type: `Boolean`  
  Default: false  
  By default, fixture list calls will not include seating information to reduce request load. A call with `includeSeat` set to `true` will occur on ticket fixtures instead.
- `homeOnly` _Optional_  
  Type: `Boolean`  
  Default: false  
  Whether to only list out home fixtures only.

### Returns

An array of fixtures starting from the next unplayed fixture until `n` amount based on "load more" button incrementation. Each increment will add three more data from the previous one.

### Response Example

```js
{
  increment: 1,
  length: 3,
  total: 23,
  data: [
    {
      _id: 'abcdefghjijkl',
      homeTeam: 'Crustecan Warrior',
      awayTeam: 'Fluorascent FC',
      event: 'Premier League',
      date: '2021-11-19T09:59:53.470Z', // Date string.
      isHome: true,
      seats: [
        {
          section: 'A',
          seatNumber: '001-0100',
          isBooked: true
        },
        {
          section: 'A',
          seatNumber: '001-0101',
          isBooked: false,
        }
      ],
      isTicketAvailable: true,
    },
    // other fixtures data ...
  ]
}
```

### **Get Fixture Details**

Gets a fixture's details based on its ID.

### Endpoint

```
GET /api/fixture/:id
```

### Parameters

- `includeSeat` _Optional_  
  Type: `Boolean`  
  Default: false  
  Whether or not to include seating information too.

### Returns

A fixture's detailed information.

### Response Example

```js
{
  data: {
    _id: '61a349fca56d68263cd101c9',
    homeTeam: 'Crustecan Warrior',
    awayTeam: 'Fluorascent FC',
    event: 'Premier League',
    date: '2021-11-19T09:59:53.470Z',
    isHome: true,
    seats: [Seat],
    isTicketAvailable: true,
  },
},
```

---

## Ticket

### Data Structure

```js
{
  _id: String, // MongoDB ObjectId.
  fixture: Object, // Reference to fixtur data.
  seat: {
    section: String,
    seatNumber: String,
  },
  created: Date,
}
```

#### Example:

```js
{
  _id: '61b33ffdaf18fa1a58d147f1',
  fixture: '61a349fca56d68263cd101c9',
  seat: {
    section: 'A',
    seatNumber: '001-0100',
  },
  created: '2022-01-13T13:26:43.410Z',
}
```

### **Get Ticket Details**

Get ticket detailed information.

### Endpoint

```
GET /api/ticket/:id
```

### Parameters

No parameters.

### Returns

Ticket's detailed information.

### Response Example

```js
{
  success: true,
  data: {
    seat: {
      section: 'A',
      seatNumber: '001-0001'
    },
    _id: '61b33ffdaf18fa1a58d147f1',
    fixture: {
      _id: '61a349fca56d68263cd101c9',
      homeTeam: 'Crustecan Warrior FC',
      awayTeam: 'Gatekeepers',
      event: 'Premier League',
      date: '2022-04-27T18:52:34.760Z',
      isHome: true,
      seats: [Seat],
      isTicketAvailable: true,
    },
  }
},
```

### **Create Checkout Session**

Create checkout session powered by Stripe to get URL to payment page. While the payment session is still active (it's neither succeed or failed), the ordered seat status will not be available for other session. User will be given 15 minutes to complete the order, else it will be canceled automatically.

### Endpoint

```
POST /api/ticket/create-checkout-session
```

### Parameters

No parameters.

### Body Data

Type: JSON

- `fixtureId` **Required**  
  Type: `String`  
  Default: ''  
  Fixture's ID.
- `orders` **Required**  
  Type: `Object`  
  Default: null  
  An array of seat orders object.
  - `section` **Required**  
    Type: String  
    Default: ''  
    Seat section.
  - `seatNumber` **Required**  
    Type: String  
    Default: ''  
    Seat number.

### Returns

Redirect URL to Stripe checkout page.

### Response Example

```js
{
  url: 'https://checkout.stripe.com/pay/cs_test_b1pBhJ0sunnIsy1IEiX1DIjlgaGWEJm7szRzmLcpzFr1gO81q9CygtNU3T#fidkdWxOYHwnPyd1blpxYHZxWk5DYkQ2PEJzXTdJa0Z8M3JiUnd9NENudjU1Z21VNlZSdDInKSdjd2poVmB3c2B3Jz9xd3BgKSdpZHxqcHFRfHVgJz8naHBpcWxabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl' // URL will be generated by Stripe.
},
```

---

## Transaction

Transaction data to monitor all initiated checkouts, its status, and act as a reference point for checkout related routes.

### Data Structure

```js
{
  status: String,
  fixture: String, // Fixture ID.
  orders: [
    {
      section: String,
      seatNumber: String,
    },
  ],
  stripeSessionId: String,
  stripeSessionUrl: String,
  user: String, // User ID.
  created: Date,
}
```

#### Example:

```js
{
  _id : "6226094b26970a04bcec89ff",
  status : "complete",
  fixture : "61a349fca56d68263cd107cc",
  orders : [
    {
      _id : "6226094b26970a04bcec8a00",
      section : "A",
      seatNumber : "001-0001"
    }
  ],
  stripeSessionId : "cs_test_b1pBhJ0sunnIsy1IEiX1DIjlgaGWEJm7szRzmLcpzFr1gO81q9CygtNU3T",
  stripeSessionUrl : "https://checkout.stripe.com/pay/cs_test_b1pBhJ0sunnIsy1IEiX1DIjlgaGWEJm7szRzmLcpzFr1gO81q9CygtNU3T#fidkdWxOYHwnPyd1blpxYHZxWk5DYkQ2PEJzXTdJa0Z8M3JiUnd9NENudjU1Z21VNlZSdDInKSdjd2poVmB3c2B3Jz9xd3BgKSdpZHxqcHFRfHVgJz8naHBpcWxabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl",
  user : "61b33ea9af18fa1a58d147e6",
  created : "2022-03-07T13:31:55.927Z",
}
```

---

## User

User management system. Authentication is build using Passport.

### **Register**

Register a new user.

### Endpoint

```
POST /api/user/register
```

### Parameters

No parameters.

### Body Data

Type: JSON

- `username` **Required**  
  Type: `String`  
  Default: ''  
  User's username. Used as one of the login credentials.
- `password` **Required**  
  Type: `String`  
  Default: ''  
  User's password.
- `email` **Required**  
  Type: String  
  Default: ''  
  User's email.
- `name` **Required**  
  Type: String  
  Default: ''  
  User's full name.

### Returns

User's username.

### Response Example

```js
{
  success: true,
  user: {
    username: 'bigjoe'
  }
},
```

### **Login**

User login.

### Endpoint

```
POST /api/user/login
```

### Parameters

No parameters.

### Body Data

Type: JSON

- `username` **Required**  
  Type: `String`  
  Default: ''  
  User's username. Used as one of the login credentials.
- `password` **Required**  
  Type: `String`  
  Default: ''  
  User's password.

### Returns

User's username.

### Response Example

```js
{
  success: true,
  user: {
    username: 'bigjoe'
  }
},
```

### **Logout**

User logout.

### Endpoint

```
GET /api/user/logout
```

### Parameters

No parameters.

### Returns

None.

### Response Example

```js
{
  success: true,
}
```

### **Get Login Session**

Get existing login session according to session cookie, if there is any.

### Endpoint

```
GET /api/user/login-session
```

### Parameters

No parameters.

### Returns

None.

### Response Example

```js
{
  success: true,
  user: {
    username: 'bigjoe'
  }
},
```

### **Get Ticket List**

Get user's ticket list.

### Endpoint

```
GET /api/user/ticket
```

### Parameters

- `page` **Required**  
  Type: `Number`  
  Default: 1  
  Current page iteration.
- `latest` _Optional_  
  Type: `Boolean`  
  Default: false  
  Whether to get the latest tickets or not. If `true`, it will return the last 3 ticket data. Otherwise, 10 ticket data will be given.

### Returns

User's ticket list. Sorted by the latest entries.

### Response Example

```js
{
  page: 1,
  totalPages: 10
  length: 10,
  total: 100,
  data: [
    {
      _id : "61b33ffdaf18fa1a58d147f1",
      fixture : "61a349fca56d68263cd101c9",
      seat : {
          section : "A",
          seatNumber : "001-0001"
      },
      created : "2022-01-13T13:26:43.410Z"
    },
    // other ticket data ...
  ]
}

```

### **Get Transaction List**

Get user's transaction list.

### Endpoint

```
GET /api/user/transaction
```

### Parameters

- `page` **Required**  
  Type: `Number`  
  Default: 1  
  Current page iteration.
- `latest` _Optional_  
  Type: `Boolean`  
  Default: false  
  Whether to get the latest tickets or not. If `true`, it will return the last 3 ticket data. Otherwise, 10 ticket data will be given.

### Returns

User's transaction list. Sorted by the latest entries.

### Response Example

```js
{
  page: 1,
  totalPages: 10
  length: 10,
  total: 100,
  data: [
    {
      _id : "6226094b26970a04bcec89ff",
      status : "complete",
      fixture : "61a349fca56d68263cd107cc",
      orders : [
        {
          _id : "6226094b26970a04bcec8a00",
          section : "A",
          seatNumber : "001-0001"
        }
      ],
      stripeSessionId : "cs_test_b1pBhJ0sunnIsy1IEiX1DIjlgaGWEJm7szRzmLcpzFr1gO81q9CygtNU3T",
      stripeSessionUrl : "https://checkout.stripe.com/pay/cs_test_b1pBhJ0sunnIsy1IEiX1DIjlgaGWEJm7szRzmLcpzFr1gO81q9CygtNU3T#fidkdWxOYHwnPyd1blpxYHZxWk5DYkQ2PEJzXTdJa0Z8M3JiUnd9NENudjU1Z21VNlZSdDInKSdjd2poVmB3c2B3Jz9xd3BgKSdpZHxqcHFRfHVgJz8naHBpcWxabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl",
      user : "61b33ea9af18fa1a58d147e6",
      created : "2022-03-07T13:31:55.927Z",
    }
    // other transaction data ...
  ]
}
```

### **Cancel Transaction**

Manually cancel an open checkout session.

### Endpoint

```
PUT /api/user/transaction/:id/cancel
```

### Parameters

No paramaters.

### Returns

None.

### Response Example

```js
{
  success: true,
}
```
