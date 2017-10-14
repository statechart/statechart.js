"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./sink/external-event-router/index");
const index_2 = require("./sink/external-event/index");
const index_3 = require("./sink/internal-event/index");
const index_4 = require("./sink/invocation/index");
const index_5 = require("./sink/datamodel/index");
const index_6 = require("./sink/macrostep/index");
const index_7 = require("./sink/microstep/index");
const index_8 = require("./sink/proxy/index");
class Interpreter {
    constructor(events, datamodel, document) {
        this.datamodel = datamodel;
        this.document = document;
        this.events = events;
    }
    run(eventsSink, invocations, configuration, scheduler) {
        const { datamodel, document } = this;
        const invocationSink = new index_4.InvocationSink(invocations, document, datamodel);
        const datamodelEvent = new index_8.Proxy();
        const datamodelSink = new index_5.DatamodelSink(datamodelEvent, datamodel, scheduler);
        const microstepConfiguration = new index_8.Proxy();
        const microstep = new index_7.MicrostepSink(microstepConfiguration, datamodelSink, document);
        datamodelEvent.sink = microstep;
        const macrostep = new index_6.MacrostepSink(microstep, configuration, invocationSink);
        microstepConfiguration.sink = macrostep;
        const internalEventSink = new index_3.InternalEventSink(macrostep);
        const externalEventSink = new index_2.ExternalEventSink(macrostep);
        datamodel.internalEvents = internalEventSink;
        datamodel.externalEvents = new index_1.ExternalEventRouter(externalEventSink, eventsSink);
        const disposable = this.events.run(externalEventSink, scheduler);
        // initialize the configuration
        microstep.event(scheduler.currentTime());
        return disposable;
    }
}
exports.default = Interpreter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSw4REFBeUU7QUFDekUsdURBQWdFO0FBQ2hFLHVEQUFnRTtBQUNoRSxtREFBeUQ7QUFDekQsa0RBQXVEO0FBQ3ZELGtEQUF1RDtBQUN2RCxrREFBdUQ7QUFDdkQsOENBQTJDO0FBRTNDO0lBS0UsWUFDRSxNQUE0QixFQUM1QixTQUF1QyxFQUN2QyxRQUE4QjtRQUU5QixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBRUQsR0FBRyxDQUNELFVBQThCLEVBQzlCLFdBQXVELEVBQ3ZELGFBQWtDLEVBQ2xDLFNBQW9CO1FBRXBCLE1BQU0sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ3JDLE1BQU0sY0FBYyxHQUFHLElBQUksc0JBQWMsQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRTVFLE1BQU0sY0FBYyxHQUFHLElBQUksYUFBSyxFQUFnQixDQUFDO1FBQ2pELE1BQU0sYUFBYSxHQUFHLElBQUkscUJBQWEsQ0FBQyxjQUFjLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRTlFLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxhQUFLLEVBQUUsQ0FBQztRQUMzQyxNQUFNLFNBQVMsR0FBRyxJQUFJLHFCQUFhLENBQUMsc0JBQXNCLEVBQUUsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3JGLGNBQWMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDO1FBRWhDLE1BQU0sU0FBUyxHQUFHLElBQUkscUJBQWEsQ0FBQyxTQUFTLEVBQUUsYUFBYSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQzlFLHNCQUFzQixDQUFDLElBQUksR0FBRyxTQUFTLENBQUM7UUFFeEMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLHlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzNELE1BQU0saUJBQWlCLEdBQUcsSUFBSSx5QkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUUzRCxTQUFTLENBQUMsY0FBYyxHQUFHLGlCQUFpQixDQUFDO1FBQzdDLFNBQVMsQ0FBQyxjQUFjLEdBQUcsSUFBSSwyQkFBbUIsQ0FBQyxpQkFBaUIsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUVsRixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUVqRSwrQkFBK0I7UUFDL0IsU0FBUyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUV6QyxNQUFNLENBQUMsVUFBVSxDQUFDO0lBQ3BCLENBQUM7Q0FDRjtBQS9DRCw4QkErQ0MifQ==