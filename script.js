'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jeeva Kalaiselvam',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2021-06-01T10:17:24.185Z',
    '2021-06-08T14:11:59.604Z',
    '2021-06-09T17:01:17.194Z',
    '2021-06-11T07:36:17.929Z',
    '2021-06-12T10:51:36.790Z',
  ],
  currency: 'INR',
  locale: 'en-US', // de-DE
};

const account2 = {
  owner: 'Sinduja Kalaiselvam',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2021-06-08T14:11:59.604Z',
    '2021-06-09T17:01:17.194Z',
    '2021-06-11T07:36:17.929Z',
    '2021-06-12T10:51:36.790Z',
  ],
  currency: 'INR',
  locale: 'en-GB',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

//Formatting Date
function formatMovementDate(date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

  const daysPassed = Math.round(calcDaysPassed(new Date(), date));
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    return new Intl.DateTimeFormat(locale).format(date);
  }
}

function getLocalCurrencyFormat(amount, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

//Display all the latest money movements
const displayMovements = function (account, sort = false) {
  containerMovements.innerHTML = '';

  console.log(account.movements);
  const movements = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;

  //Check if the value is positive or negative and associated tag accordingly
  movements.forEach((movement, i) => {
    const type = movement > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(account.movementsDates[i]);
    const displayDate = formatMovementDate(date, account.locale);

    //Create a transaction div and append at beginning of container
    const html = `<div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type.toUpperCase()}</div>
          <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${getLocalCurrencyFormat(
            movement,
            account.locale,
            account.currency
          )}</div>
        </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

//Create usename from user info present
const createUserName = account => {
  account.username = account.owner //Create a username property in user objects and store them
    .toLowerCase()
    .split(' ')
    .map(name => name[0])
    .join('');
};

//Create username for each user present
accounts.forEach(account => {
  createUserName(account);
});

//Calcuale the total balance present in account
const calculateBalanceInAccount = account => {
  account.balance = account.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${getLocalCurrencyFormat(
    account.balance,
    account.locale,
    account.currency
  )}`;
};

//Calculate summary for income and outcome
const calculateSummary = account => {
  const income = account.movements
    .filter(movement => movement > 0)
    .reduce((balance, movement) => balance + movement);

  const outcome = account.movements
    .filter(movement => movement < 0)
    .reduce((balance, movement) => balance + movement);

  const interest = account.movements
    .filter(movement => movement > 0)
    .map(deposit => deposit * (account.interestRate / 100))
    .filter((interest, i, arr) => interest >= 1)
    .reduce((balance, movement) => balance + movement, 0);

  labelSumIn.textContent = `${income.toFixed(2)} ₹`;
  labelSumOut.textContent = `${Math.abs(outcome).toFixed(2)} ₹`;
  labelSumInterest.textContent = `${Math.abs(interest).toFixed(2)} ₹`;
};

//Current Session declarations
let currentAccount, loginTimer;

const now = new Date();
const day = now.getDate();
const month = now.getMonth() + 1;
const year = now.getFullYear();
const hour = now.getHours();
const min = now.getMinutes();
labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

const logoutSession = () => {
  containerApp.style.opacity = 0;
};

let timer;
//Start logout timer
const startLogoutTimer = () => {
  let time = 300;
  const tick = () => {
    let minutes = Math.trunc(time / 60);
    let seconds = time % 60 > 0 ? String(time % 60) : '00';
    labelTimer.textContent = `0${minutes}:${seconds}`;

    if (time === 0) {
      logoutSession();
    }
    time -= 1;
  };
  tick(); //Initiate the function first
  timer = setInterval(tick, 1000); //Run the timer until logout time threshold is met
  return timer;
};

const updateUI = currentAccount => {
  displayMovements(currentAccount);
  calculateBalanceInAccount(currentAccount);
  calculateSummary(currentAccount);
};

//Event Listeners

btnLogin.addEventListener('click', e => {
  e.preventDefault();

  currentAccount = accounts.find(
    account => account.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    console.log('loggedin');
    //Display UI, Movements, Balance and Summary
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    //Setting Date for Balance section
    const currentTime = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    };

    const locale = currentAccount.locale;
    labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(
      currentTime
    );

    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    //Check if old timer is already active from another session and clear it
    if (loginTimer) clearInterval(loginTimer);
    loginTimer = startLogoutTimer();

    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', e => {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAccount = accounts.find(
    account => account.username === inputTransferTo.value
  );
  if (
    amount > 0 &&
    receiverAccount &&
    currentAccount.balance >= amount &&
    receiverAccount.username !== currentAccount.username
  ) {
    //Add Transfer Amount for both sender and receiver
    currentAccount.movements.push(-amount);
    receiverAccount.movements.push(amount);

    //Add Transfer Date for both sender and receiver
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAccount.movementsDates.push(new Date().toISOString());

    updateUI(currentAccount);
  } else {
    console.log('Transfer Invalid');
  }
  inputTransferAmount.value = inputTransferTo.value = '';

  //Reset timer for session
  clearInterval(timer);
  timer = startLogoutTimer();
});

btnClose.addEventListener('click', e => {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      account => account.username === currentAccount.username
    );

    //Delete the user account
    accounts.splice(index, 1);

    //Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

btnLoan.addEventListener('click', e => {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);
  if (
    amount > 0 &&
    currentAccount.movements.some(movement => movement > amount * 0.1)
  ) {
    currentAccount.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    updateUI(currentAccount);
    inputLoanAmount.value = '';

    //Reset timer for session
    clearInterval(timer);
    timer = startLogoutTimer();
  }
});

let sorted = false;
btnSort.addEventListener('click', e => {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
  ['INR', 'Indian Rupees'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////

//FAKE LOGIN
const mockLogin = () => {
  currentAccount = account1;
  updateUI(currentAccount);
  containerApp.style.opacity = 100;
  //Check if old timer is already active from another session and clear it
  if (loginTimer) clearInterval(loginTimer);
  loginTimer = startLogoutTimer();
};
//mockLogin();
