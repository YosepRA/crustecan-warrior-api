function generateSeats() {
  const seats = [];

  const model = {
    A: {
      row: 5,
      col: 10,
    },
    B: {
      row: 5,
      col: 7,
    },
    C: {
      row: 5,
      col: 10,
    },
    D: {
      row: 5,
      col: 7,
    },
  };

  Object.keys(model).forEach((section) => {
    const layout = model[section];

    for (let row = 0; row < layout.row; row += 1) {
      const rowPad = (row + 1).toString().padStart(3, '0');

      for (let col = 0; col < layout.col; col += 1) {
        const colPad = (col + 1).toString().padStart(4, '0');

        const newSeat = {
          section,
          seatNumber: `${rowPad}-${colPad}`,
          isAvailable: true,
        };

        seats.push(newSeat);
      }
    }
  });

  return seats;
}

async function promiseResolver(promise) {
  try {
    const data = await promise;
    return [data, null];
  } catch (err) {
    return [null, err];
  }
}

module.exports = { generateSeats, promiseResolver };
