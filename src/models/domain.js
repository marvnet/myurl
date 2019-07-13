
module.exports = (sequelize, DataTypes) => {
    const Domain = sequelize.define('Domain', {
        uuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV1,
            primaryKey: true
        },
        domain: {
            type: DataTypes.STRING
        }
    }, {})

    Domain.associate = (models) => {
        models.Domain.belongsTo(models.User, {
            onDelete: 'cascade'
        })
    }

    return Domain
}