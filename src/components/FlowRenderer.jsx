import React, { useEffect, useState } from 'react';
import { useSubscription } from '@apollo/client';
import { Controls, ReactFlow as Flow, SelectionMode, useEdgesState, useNodesState } from '@xyflow/react';
import { MESSAGE_RECEIVED } from '../graphql/subscriptions';
import '@xyflow/react/dist/base.css';


import useDimensions from './useDimensions';
import { DeviceNode } from './DeviceNode';
import { LogsNode } from './LogsNode';
import { LoggerFilterNode } from './LoggerFilterNode';
import { KeyValueFilterNode } from './KeyValueFilterNode';
import { TurboEdge } from './TurboEdge';

const panOnDrag = [1, 2];

const nodeTypes = {
    device: DeviceNode,
    logs: LogsNode,
    loggerFilter: LoggerFilterNode,
    keyValueFilter: KeyValueFilterNode
};

const dynamicFilters = [
    { key: 'userId', label: 'Exclude users', type: 'loggerFilter' },
    { key: 'sessionId', label: 'Exclude sessions', type: 'loggerFilter' },
    { key: 'name', label: 'Exclude logs', type: 'loggerFilter' },
];

const edgeTypes = {
    turbo: TurboEdge,
};

const defaultEdgeOptions = {
    type: 'turbo',
    markerEnd: 'edge-circle',
};

const FlowRenderer = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [edgesForNodeId, setEdgesForNodeId] = useState(null);

    const { data, loading, error } = useSubscription(MESSAGE_RECEIVED);

    const { width } = useDimensions();

    useEffect(() => {
        const divider = (nodes?.length + 2) / 2 + 1;
        const xDivider = width / divider;

        if (data && data.messageReceived && data.messageReceived) {
            const { message } = data.messageReceived;
            const parsedResponse = JSON.parse(data.messageReceived.device);
            console.info(parsedResponse);

            const { deviceId, deviceModel, osVersion } = parsedResponse;

            const deviceNodeId = `device-${deviceId}`;
            const messagesNodeId = `messages-${deviceId}`;

            const getNodes = (nodes) => {
                const existingDeviceNode = nodes.find(node => node.id === deviceNodeId);
                if (existingDeviceNode) {
                    const existingMessagesNodeIndex = nodes.findIndex(node => node.id === messagesNodeId);
                    const existingMessagesNode = nodes[existingMessagesNodeIndex];
                    const newExistingMessageNode = {
                        ...existingMessagesNode,
                        data: {
                            rawLogs: [
                                ...existingMessagesNode.data.rawLogs,
                                {
                                    timestamp: new Date().toISOString(),
                                    message,
                                    ...parsedResponse
                                }
                            ],
                            filters: [...existingMessagesNode?.data?.filters || []]
                        },
                    }
                    const nnodes = [
                        ...nodes.slice(0, existingMessagesNodeIndex),
                        newExistingMessageNode,
                        ...nodes.slice(existingMessagesNodeIndex + 1)
                    ];


                    dynamicFilters.map(filter => {
                        const filterNodeId = `filter-${deviceId}-${filter.key}`;

                        const existingFilterNodeIndex = nnodes.findIndex(node => node.id === filterNodeId);
                        const existingFilterNode = nnodes[existingFilterNodeIndex];

                        const addedFilters = existingFilterNode.data.filters.findIndex(f => f === parsedResponse[filter.key]) > -1 ?
                            [...existingFilterNode.data.filters] :
                            [...existingFilterNode.data.filters, parsedResponse[filter.key]];
                        const newExistingFilterNode = {
                            ...existingFilterNode,
                            data: {
                                ...existingFilterNode.data,
                                filters: addedFilters
                            },
                        }
                        nnodes[existingFilterNodeIndex] = newExistingFilterNode;
                    });
                    return nnodes;
                } else {
                    setEdgesForNodeId(deviceId);
                    const deviceNode = {
                        id: deviceNodeId,
                        type: 'device',
                        position: { x: xDivider, y: 100 },
                        data: { label: `${deviceModel} (${osVersion})` },
                    };
                    const messageNode = {
                        id: messagesNodeId,
                        type: 'logs',
                        position: { x: xDivider, y: 300 },
                        data: {
                            rawLogs: [{
                                timestamp: new Date().toISOString(),
                                message,
                                ...parsedResponse
                            }],
                            filters: dynamicFilters.map(filter => ({
                                key: filter.key,
                                values: []
                            })),
                        },
                    };

                    const filterNodes = dynamicFilters.map((filter, index) => {
                        return {
                            id: `filter-${deviceId}-${filter.key}`,
                            type: filter.type,
                            position: { x: xDivider - 300, y: 150 * (index + 1) },
                            data: {
                                deviceId,
                                label: filter.label,
                                filters: [parsedResponse[filter.key]],
                                key: filter.key,
                            }
                        }
                    });

                    return [
                        ...nodes,
                        deviceNode,
                        messageNode,
                        ...filterNodes
                    ];
                }
            }
            setNodes(getNodes);
        }
    }, [data]);

    useEffect(() => {
        if (!edgesForNodeId) return;

        const getEdges = (edges) => {
            const device2messagesEdge = `edge-device-to-message-${edgesForNodeId}`;
            const deviceNodeId = `device-${edgesForNodeId}`;
            const messagesNodeId = `messages-${edgesForNodeId}`;

            const existingDevice2MessagesEdge = edges.find(edge => edge.id === device2messagesEdge);

            if (existingDevice2MessagesEdge) return [...edges || []]

            const ed = [
                ...edges || [],
                {
                    id: device2messagesEdge,
                    source: deviceNodeId,
                    target: messagesNodeId,
                    animated: true
                },
                ...dynamicFilters.map((filter) => ({
                    id: `edge-device-to-filter-${edgesForNodeId}-${filter.key}`,
                    source: deviceNodeId,
                    target: `filter-${edgesForNodeId}-${filter.key}`,
                    sourceHandle: 'b',
                }))
            ];
            return ed;
        }

        setEdges(getEdges)
    }, [edgesForNodeId]);

    if (loading) return <div style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        justifyContent: 'center',
        alignSelf: 'center',
        height: '100%',
        textAlign: 'center'
    }}>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (

        <div style={{ width: "100vw", height: '100vh' }}>
            <Flow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                zoomOnScroll={false}
                zoomOnPinch={true}
                panOnScroll
                // fitView
                selectionOnDrag
                panOnDrag={panOnDrag}
                selectionMode={SelectionMode.Partial}
                edgeTypes={edgeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
            >
                <Controls showInteractive={false} />
                <svg>
                    <defs>
                        <linearGradient id="edge-gradient">
                            <stop offset="0%" stopColor="#ae53ba" />
                            <stop offset="100%" stopColor="#2a8af6" />
                        </linearGradient>

                        <marker
                            id="edge-circle"
                            viewBox="-5 -5 10 10"
                            refX="0"
                            refY="0"
                            markerUnits="strokeWidth"
                            markerWidth="10"
                            markerHeight="10"
                            orient="auto"
                        >
                            <circle stroke="#2a8af6" strokeOpacity="0.75" r="2" cx="0" cy="0" />
                        </marker>
                    </defs>
                </svg>
            </Flow>
        </div>
    );
};

export default FlowRenderer;