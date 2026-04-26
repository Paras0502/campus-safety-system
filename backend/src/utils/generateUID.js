const generateUID = () => {
    const prefix = "UID";
    const randomPart = Math.random().toString(36).substring(2, 10);
    const timestampPart = Date.now().toString(36);

    return `${prefix}-${randomPart}-${timestampPart}`;
};

export default generateUID;