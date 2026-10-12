import { Router, type Request, type Response } from "express";
import { getDbUserFromReq, requireAuth } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { User } from "../../models/User";
import { requireFound, requireText } from "../../utils/helper";
import { ok } from "../../utils/envelope";
import { AppError } from "../../utils/AppError";

type AddressItem = {
  _id?: string;
  fullName: string;
  address: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
};

function mapAddress(item: AddressItem) {
  return {
    _id: String(item._id || ""),
    fullName: item.fullName,
    address: item.address,
    state: item.state,
    postalCode: item.postalCode,
    isDefault: item.isDefault,
  };
}

export const customerAddressRouter = Router();

customerAddressRouter.use(requireAuth);

customerAddressRouter.get(
  "/addresses",
  asyncHandler(async (req: Request, res: Response) => {
    const dbUser = await getDbUserFromReq(req);
    const user = await User.findById(dbUser._id);

    const foundUser = requireFound(user, "User is not found", 404);

    const addresses = (foundUser.addressess || []) as AddressItem[];

    const item = [...addresses]
      .sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
      .map(mapAddress);

    res.json(ok({ item }));
  }),
);

customerAddressRouter.post(
  "/addresses",
  asyncHandler(async (req: Request<{}, {}, AddressItem>, res: Response) => {
    const dbUser = await getDbUserFromReq(req);

    const fullName = String(req.body.fullName || "").trim();
    const address = String(req.body.address || "").trim();
    const state = String(req.body.state || "").trim();
    const postalCode = String(req.body.postalCode || "").trim();

    requireText(fullName, "Name is Required");
    requireText(address, "Address is required");
    requireText(state, "State is required");
    requireText(postalCode, "Postal code is Required");

    const user = await User.findById(dbUser._id);
    const foundUser = requireFound(user, "User is not found", 404);
    const addresses = (foundUser.addressess || []) as AddressItem[];

    const shouldMarkDefault =
      req.body.isDefault === true || addresses.length === 0;

    if (shouldMarkDefault) {
      addresses.forEach((item) => (item.isDefault = false));
    }

    addresses.push({
      fullName,
      address,
      state,
      postalCode,
      isDefault: shouldMarkDefault,
    });

    await foundUser.save();

    const item = [...addresses]
      .sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
      .map(mapAddress);

    res.json(ok({ item }));
  }),
);

customerAddressRouter.patch(
  "/addresses/:addressId",
  asyncHandler(async (req: Request, res: Response) => {
    const dbUser = await getDbUserFromReq(req);
    const addressId = String(req.params.addressId || "").trim();

    requireText(addressId, "Address id is required.");
    const fullName = String(req.body.fullName || "").trim();
    const address = String(req.body.address || "").trim();
    const state = String(req.body.state || "").trim();
    const postalCode = String(req.body.postalCode || "").trim();

    requireText(fullName, "Name is Required");
    requireText(address, "Address is required");
    requireText(state, "State is required");
    requireText(postalCode, "Postal code is Required");

    const user = await User.findById(dbUser._id);
    const foundUser = requireFound(user, "User is not found", 404);
    const addresses = (foundUser.addressess || []) as AddressItem[];

    const getAddressTheUserWantToEdit = addresses.find(
      (current) => String(current._id) === addressId,
    );

    if (!getAddressTheUserWantToEdit) {
      throw new AppError(404, "Address is not found!");
    }

    const shouldMarkDefault =
      req.body.isDefault === true || addresses.length === 0;

    if (shouldMarkDefault) {
      addresses.forEach((item) => {
        item.isDefault = false;
      });
    }

    getAddressTheUserWantToEdit.fullName = fullName;
    getAddressTheUserWantToEdit.address = address;
    getAddressTheUserWantToEdit.postalCode = postalCode;
    getAddressTheUserWantToEdit.state = state;

    if (shouldMarkDefault) {
      getAddressTheUserWantToEdit.isDefault = true;
    }

    await foundUser.save();

    const item = [...(foundUser.addressess as AddressItem[])]
      .sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
      .map(mapAddress);

    res.json(ok({ item }));
  }),
);

customerAddressRouter.delete(
  "/addresses/:addressId",
  asyncHandler(async (req: Request, res: Response) => {
    const dbUser = await getDbUserFromReq(req);
    const addressId = String(req.params.addressId || "").trim();

    requireText(addressId, "Address id is required.");
    const user = await User.findById(dbUser._id);
    const foundUser = requireFound(user, "User is not found", 404);

    const addresses = (foundUser.addressess || []) as AddressItem[];

    const addressToBeDeletedIndex = addresses.findIndex(
      (currentIndex) => String(currentIndex._id) === addressId,
    );

    if (addressToBeDeletedIndex < 0) {
      throw new AppError(404, "Address is not found");
    }

    const wasDefault = addresses[addressToBeDeletedIndex].isDefault;

    addresses.splice(addressToBeDeletedIndex, 1);

    if (
      wasDefault &&
      addresses.length > 0 &&
      !addresses.some((address) => address.isDefault)
    ) {
      addresses[0].isDefault = true;
    }

    await foundUser.save();

    const item = [...(foundUser.addressess as AddressItem[])]
      .sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
      .map(mapAddress);

    res.json(ok({ item }));
  }),
);
