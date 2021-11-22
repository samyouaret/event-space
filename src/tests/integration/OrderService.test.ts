import { getPrisma } from "../../app/prisma";
import EventService from "../../app/services/EventService";
import UserService from "../../app/services/UserService";
import OrderService from "../../app/services/OrderService";
import { generateFakeEvent } from "../../helpers/fakers";
import { seedNewUser } from "../../helpers/test";
import type { Order } from ".prisma/client";

let prisma = getPrisma();
let userService = new UserService(prisma);
let orderService = new OrderService(prisma, {} as any);
let paymentIntent = "some-intent";

let user: any;
beforeAll(async () => {
    await prisma.$connect();
    user = await seedNewUser(userService);
});

afterAll(async () => {
    await prisma.$disconnect();
});

test('should create new Order', async () => {
    let eventService: EventService = new EventService(prisma);
    let fakeEvent = generateFakeEvent(user);
    let createdEvent = await eventService.create(fakeEvent);
    let [affected, order] = await orderService.createOrder(
        {
            eventId: createdEvent.id,
            userId: user.id,
            paymentIntent: paymentIntent
        }
    ) as [number, Order];
    expect(affected).toBe(1);
    expect(order.status).toBe("PENDING");
});

test('should create new confirmed Order', async () => {
    let eventService: EventService = new EventService(prisma);
    let fakeEvent = generateFakeEvent(user);
    let createdEvent = await eventService.create(fakeEvent);
    let [affected, order] = await orderService.createOrder(
        {
            eventId: createdEvent.id,
            userId: user.id,
            paymentIntent: paymentIntent,
            status: "CONFIRMED"
        }
    ) as [number, Order];
    expect(affected).toEqual(1);
    expect(order.status).toBe("CONFIRMED");
});

test('should confirm a current Order', async () => {
    let eventService: EventService = new EventService(prisma);
    let fakeEvent = generateFakeEvent(user);
    let createdEvent = await eventService.create(fakeEvent);
    let [affected, order] = await orderService.createOrder(
        {
            eventId: createdEvent.id,
            userId: user.id,
            paymentIntent: paymentIntent,
        }
    ) as [number, Order];
    expect(order.status).toBe("PENDING");
    await orderService.confirmOrder(order.id);
    let updatedOrder = await prisma.order.findUnique({
        where: {
            id: order.id
        }
    });
    expect(updatedOrder?.status).toBe("CONFIRMED");
});

test('should cancel a current Order', async () => {
    let eventService: EventService = new EventService(prisma);
    let fakeEvent = generateFakeEvent(user);
    let createdEvent = await eventService.create(fakeEvent);
    let [affected, order] = await orderService.createOrder(
        {
            eventId: createdEvent.id,
            userId: user.id,
            paymentIntent: paymentIntent,
            status: "CONFIRMED"
        }
    ) as [number, Order];
    await orderService.cancelOrder(order as unknown as Order);
    let deletedOrder = await prisma.order.findUnique({
        where: {
            id:
                order.id
        }
    });
    expect(affected).toEqual(1);
    expect(deletedOrder).toBeNull();
});

test('should Fail create a new Order with no available seats', async () => {
    let fakeEvent = generateFakeEvent(user);
    fakeEvent.takenSeats = fakeEvent.seats;
    let createdEvent = await prisma.event.create({ data: fakeEvent });
    expect.assertions(2);
    try {
        await orderService.createOrder(
            {
                eventId: createdEvent.id,
                userId: user.id,
                paymentIntent: paymentIntent,
            }
        ) as [number, Order];
    } catch (error) {
        console.log(error);
        let event = await prisma.event.findUnique({
            where: {
                id:
                    createdEvent.id
            }
        });
        expect((error as Error).message).toBe('Cannot create Order, no more available Seats');
        expect(createdEvent.takenSeats).toEqual(event?.takenSeats);
    }
});

test('should Fail create a new Order if Sale end date passed', async () => {
    let fakeEvent = generateFakeEvent(user);
    let oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 1);
    fakeEvent.endSale = oldDate;
    let createdEvent = await prisma.event.create({ data: fakeEvent });
    let [affected] = await orderService.createOrder(
        {
            eventId: createdEvent.id,
            userId: user.id,
            paymentIntent: paymentIntent,
            status: "CONFIRMED"
        }
    ) as [number, null];
    expect(affected).toEqual(0);
});

test('should fail create new Order for already purchased event', async () => {
    let eventService: EventService = new EventService(prisma);
    let fakeEvent = generateFakeEvent(user);
    let createdEvent = await eventService.create(fakeEvent);
    await orderService.createOrder(
        {
            eventId: createdEvent.id,
            userId: user.id,
            paymentIntent: paymentIntent,
        }
    );
    let [affected, order] = await orderService.createOrder(
        {
            eventId: createdEvent.id,
            userId: user.id,
            paymentIntent: paymentIntent,
        }
    );
    expect(affected).toBe(0);
    expect(order).toBeNull();
});

test('should complete order when payment sucess', async () => {
    let eventService: EventService = new EventService(prisma);
    let getPaymentEventMock = jest.fn();
    let paymentServiceMock = {
        getPaymentEvent: getPaymentEventMock
    }
    let orderService: OrderService = new OrderService(prisma,
        paymentServiceMock as any);
    let fakeEvent = generateFakeEvent(user);
    let createdEvent = await eventService.create(fakeEvent);
    let [event, order] = await orderService.createOrder(
        {
            eventId: createdEvent.id,
            userId: user.id,
            paymentIntent: paymentIntent,
        }
    ) as [number, Order];
    getPaymentEventMock.mockImplementation(() => {
        return { type: "payment_intent.succeeded", metadata: { orderId: order.id } }
    });

    let completedOrder = await orderService.completePaidOrder({
        signature: "sig", eventBody: {}
    });
    expect(completedOrder?.status).toBe("CONFIRMED");
});

async function testEventType(eventType: string) {
    let eventService: EventService = new EventService(prisma);
    let getPaymentEventMock = jest.fn();
    let paymentServiceMock = {
        getPaymentEvent: getPaymentEventMock
    }
    let orderService: OrderService = new OrderService(prisma,
        paymentServiceMock as any);
    let fakeEvent = generateFakeEvent(user);
    let createdEvent = await eventService.create(fakeEvent);
    let [, order] = await orderService.createOrder(
        {
            eventId: createdEvent.id,
            userId: user.id,
            paymentIntent: paymentIntent,
        }
    ) as [number, Order];
    getPaymentEventMock.mockImplementation(() => {
        return { type: eventType, metadata: { orderId: order.id } }
    });

    await orderService.completePaidOrder({
        signature: "sig", eventBody: {}
    });
    let deletedOrder = await prisma.order.findUnique({
        where: {
            id:
                order.id
        }
    });
    expect(deletedOrder).toBeNull();
}

test('should cancel order when payment failed', async () => {
    await testEventType("payment_intent.failed");
});

test('should cancel order when payment canceled', async () => {
    await testEventType("payment_intent.canceled");
});