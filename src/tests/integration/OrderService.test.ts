import { getPrisma } from "../../app/prisma";
import EventService from "../../app/services/EventService";
import UserService from "../../app/services/UserService";
import OrderService from "../../app/services/OrderService";
import { generateFakeEvent } from "../../helpers/fakers";
import { seedNewUser } from "../../helpers/test";
import type { Event, Order } from ".prisma/client";

let prisma = getPrisma();
let userService = new UserService(prisma);
let orderService = new OrderService(prisma);
let user: any;
beforeAll(async () => {
    await prisma.$connect();
    user = await seedNewUser(userService);
});

afterAll(async () => {
    await prisma.$disconnect();
});

afterAll(async () => {
    await prisma.order.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();
});

test('should create new Order', async () => {
    let eventService: EventService = new EventService(prisma);
    let fakeEvent = generateFakeEvent(user);
    let createdEvent = await eventService.create(fakeEvent);
    let result = await orderService.createOrder(
        createdEvent.id,
        user.id
    ) as [Event, Order];
    expect(result).toBeTruthy();
    expect(result[0].takenSeats).toBe(1);
    expect(result[1].status).toBe("PENDING");
});

test('should create new confirmed Order', async () => {
    let eventService: EventService = new EventService(prisma);
    let fakeEvent = generateFakeEvent(user);
    let createdEvent = await eventService.create(fakeEvent);
    let result = await orderService.createOrder(
        createdEvent.id,
        user.id,
        "CONFIRMED"
    ) as [Event, Order];
    expect(result).toBeTruthy();
    expect(result[0].takenSeats).toBe(1);
    expect(result[1].status).toBe("CONFIRMED");
});

test('should confirm a current Order', async () => {
    let eventService: EventService = new EventService(prisma);
    let fakeEvent = generateFakeEvent(user);
    let createdEvent = await eventService.create(fakeEvent);
    let result = await orderService.createOrder(
        createdEvent.id,
        user.id,
    ) as [Event, Order];
    expect(result[1].status).toBe("PENDING");
    await orderService.confirmOrder(result[1].id);
    let order = await prisma.order.findUnique({
        where: {
            id: result[1].id
        }
    });
    expect(order?.status).toBe("CONFIRMED");
});

test('should cancel a current Order', async () => {
    let eventService: EventService = new EventService(prisma);
    let fakeEvent = generateFakeEvent(user);
    let createdEvent = await eventService.create(fakeEvent);
    let [event, order] = await orderService.createOrder(
        createdEvent.id,
        user.id,
    ) as [Event, Order];
    expect(order).toBeTruthy();
    await orderService.cancelOrder(order as unknown as Order);
    let deletedOrder = await prisma.order.findUnique({
        where: {
            id:
                order.id
        }
    });
    expect(deletedOrder).toBeNull();
    let updatedEvent = await prisma.event.findUnique({
        where: {
            id:
                event.id
        }
    });
    expect(updatedEvent?.seats).toBe(createdEvent.seats);
});

test('should Fail create a new Order with no available seats', async () => {
    let fakeEvent = generateFakeEvent(user);
    fakeEvent.takenSeats = fakeEvent.seats;
    let createdEvent = await prisma.event.create({ data: fakeEvent });
    let result = await orderService.createOrder(
        createdEvent.id,
        user.id
    );
    expect(result).toBeFalsy();
});

test('should Fail create a new Order with if Sale end date passed', async () => {
    let fakeEvent = generateFakeEvent(user);
    let oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 1);
    fakeEvent.endSale = oldDate;
    let createdEvent = await prisma.event.create({ data: fakeEvent });
    let result = await orderService.createOrder(
        createdEvent.id,
        user.id
    );
    expect(result).toBeFalsy();
});

test('should fail create new Order for already purchased event', async () => {
    let eventService: EventService = new EventService(prisma);
    let fakeEvent = generateFakeEvent(user);
    let createdEvent = await eventService.create(fakeEvent);
    await orderService.createOrder(
        createdEvent.id,
        user.id
    );
    let result = await orderService.createOrder(
        createdEvent.id,
        user.id
    );
    expect(result).toBeFalsy();
});